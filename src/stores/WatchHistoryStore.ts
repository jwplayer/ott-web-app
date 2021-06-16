import { Store } from 'pullstate';
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
    // Store persist data now, add playlistItems once API data ready
    watchHistoryStore.update((state) => {
      state.watchHistory = savedItems;
    });

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

export const createWatchHistoryItem = (
  item: PlaylistItem | undefined,
  videoProgress: VideoProgress,
): WatchHistoryItem => {
  return {
    mediaid: item?.mediaid,
    title: item?.title,
    tags: item?.tags,
    duration: videoProgress.duration,
    progress: videoProgress.progress,
    playlistItem: item,
  } as WatchHistoryItem;
};

type GetProgressFn = () => VideoProgress | null;
export type SaveItemFn = (item: PlaylistItem, getProgress: GetProgressFn) => void;

export const useWatchHistory = () => {
  const watchHistory = watchHistoryStore.useState((state) => state.watchHistory);

  const saveItem: SaveItemFn = (item, getProgress) => {
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

  return { saveItem, removeItem, hasItem, getPlaylist };
};
