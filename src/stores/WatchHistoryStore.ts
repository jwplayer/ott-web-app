import { Store } from 'pullstate';
import { useEffect } from 'react';
import type { Playlist, PlaylistItem } from 'types/playlist';
import type { VideoProgress } from 'types/video';
import type { WatchHistoryItem } from 'types/watchHistory';

import { PersonalShelf } from '../enum/PersonalShelf';
import { getMediaById } from '../services/api.service';
import * as persist from '../utils/persist';

type WatchHistoryStore = {
  watchHistory: WatchHistoryItem[];
};

const PERSIST_KEY_WATCH_HISTORY = `history${window.configId ? `-${window.configId}` : ''}`;

export const watchHistoryStore = new Store<WatchHistoryStore>({
  watchHistory: [],
});

export const initializeWatchHistory = async () => {
  const savedItems: WatchHistoryItem[] | null = persist.getItem(PERSIST_KEY_WATCH_HISTORY) as WatchHistoryItem[] | null;

  if (savedItems) {
    const watchHistory = await Promise.all(
      savedItems.map(async (item) =>
        createWatchHistoryItem(await getMediaById(item.mediaid), { duration: item.duration, progress: item.progress }),
      ),
    );

    watchHistoryStore.update((state) => {
      state.watchHistory = watchHistory.filter((item) => !!item.mediaid);
    });
  }

  return watchHistoryStore.subscribe(
    (state) => state.watchHistory,
    (watchHistory) =>
      persist.setItem(
        PERSIST_KEY_WATCH_HISTORY,
        watchHistory.map(({ mediaid, title, tags, duration, progress }) => ({
          mediaid,
          title,
          tags,
          duration,
          progress,
        })),
      ),
  );
};

const createWatchHistoryItem = (item: PlaylistItem | undefined, videoProgress: VideoProgress): WatchHistoryItem => {
  return {
    mediaid: item?.mediaid,
    title: item?.title,
    tags: item?.tags,
    duration: videoProgress.duration,
    progress: videoProgress.progress,
    playlistItem: item,
  } as WatchHistoryItem;
};

type GetProgressFn = () => VideoProgress;

export const useWatchHistoryUpdater = (item: PlaylistItem, getProgress: GetProgressFn): void => {
  useEffect(() => {
    const savePosition = () => {
      const { watchHistory } = watchHistoryStore.getRawState();
      const videoProgress = getProgress();
      if (!videoProgress) return;

      const watchHistoryItem = createWatchHistoryItem(item, videoProgress);

      const index = watchHistory.findIndex(({ mediaid }) => mediaid === watchHistoryItem.mediaid);
      if (index > -1) {
        watchHistoryStore.update((state) => {
          state.watchHistory[index] = watchHistoryItem;
        });
      } else {
        watchHistoryStore.update((state) => {
          state.watchHistory.unshift(watchHistoryItem);
        });
      }
    };
    const visibilityListener = () => document.visibilityState === 'hidden' && savePosition();

    window.addEventListener('beforeunload', savePosition);
    window.addEventListener('visibilitychange', visibilityListener);

    return () => {
      savePosition();
      window.removeEventListener('beforeunload', savePosition);
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, []);
};

export const useWatchlist = () => {
  const watchHistory = watchHistoryStore.useState((state) => state.watchHistory);

  // const saveItem = (watchHistoryItem: WatchHistoryItem, item: PlaylistItem) => {
  //   // move savePosition to here?
  // };

  const removeItem = (item: PlaylistItem) => {
    watchHistoryStore.update((state) => {
      state.watchHistory = state.watchHistory.filter(({ mediaid }) => mediaid !== item.mediaid);
    });
  };

  const hasItem = (item: PlaylistItem) => {
    return watchHistory.some(({ mediaid }) => mediaid === item.mediaid);
  };

  const getPlaylist = () => {
    return {
      feedid: PersonalShelf.ContinueWatching,
      title: 'Continue watching',
      playlist: watchHistory.map(({ playlistItem }) => playlistItem),
    } as Playlist;
  };

  return { removeItem, hasItem, getPlaylist };
};
