import { Store } from 'pullstate';
import type { Playlist, PlaylistItem } from 'types/playlist';
import type { VideoProgress } from 'types/video';
import type { WatchHistoryItem } from 'types/watchHistory';

import { VideoProgressMinMax } from '../config';
import { PersonalShelf } from '../enum/PersonalShelf';
import { getMediaById } from '../services/api.service';
import * as persist from '../utils/persist';

import { AccountStore, updatePersonalShelf } from './AccountStore';

type WatchHistoryStore = {
  watchHistory: WatchHistoryItem[];
  playlistItemsLoaded: boolean;
};

const PERSIST_KEY_WATCH_HISTORY = `history${window.configId ? `-${window.configId}` : ''}`;

export const watchHistoryStore = new Store<WatchHistoryStore>({
  watchHistory: [],
  playlistItemsLoaded: false,
});

export const restoreWatchHistory = async () => {
  const { user } = AccountStore.getRawState();

  const savedItems = user ? user.externalData?.history : persist.getItem<WatchHistoryItem[]>(PERSIST_KEY_WATCH_HISTORY);

  if (savedItems) {
    // Store savedItems immediately, so we can show the watchhistory while we fetch the mediaItems
    watchHistoryStore.update((state) => {
      state.watchHistory = savedItems;
    });

    const watchHistory = await Promise.all(
      savedItems.map(async (item) => createWatchHistoryItem(await getMediaById(item.mediaid), { duration: item.duration, progress: item.progress })),
    );

    watchHistoryStore.update((state) => {
      state.watchHistory = watchHistory.filter((item) => !!item.mediaid);
      state.playlistItemsLoaded = true;
    });
  }
};

export const initializeWatchHistory = () => {
  restoreWatchHistory();

  const updateWatchHistory = (watchHistory: WatchHistoryItem[]) => {
    const { user } = AccountStore.getRawState();

    if (user) {
      return updatePersonalShelf();
    } else {
      return persist.setItem(
        PERSIST_KEY_WATCH_HISTORY,
        watchHistory.map(({ mediaid, title, tags, duration, progress }) => ({
          mediaid,
          title,
          tags,
          duration,
          progress,
        })),
      );
    }
  };

  return watchHistoryStore.subscribe((state) => state.watchHistory, updateWatchHistory);
};

export const createWatchHistoryItem = (item: PlaylistItem | undefined, videoProgress: VideoProgress): WatchHistoryItem => {
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
type SaveItemFn = (item: PlaylistItem, getProgress: GetProgressFn) => void;
type RemoveItemFn = (item: PlaylistItem) => void;
type HasItemFn = (item: PlaylistItem) => boolean;
type getPlaylistFn = () => Playlist;
type getDictionaryFn = () => { [key: string]: number };

type UseWatchHistoryReturn = {
  saveItem: SaveItemFn;
  removeItem: RemoveItemFn;
  hasItem: HasItemFn;
  getPlaylist: getPlaylistFn;
  getDictionary: getDictionaryFn;
};

export const useWatchHistory = (): UseWatchHistoryReturn => {
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

  const getPlaylist = () =>
    ({
      feedid: PersonalShelf.ContinueWatching,
      title: 'Continue watching',
      playlist: watchHistory
        .filter(({ playlistItem, progress }) => !!playlistItem && progress > VideoProgressMinMax.Min && progress < VideoProgressMinMax.Max)
        .map(({ playlistItem }) => playlistItem),
    } as Playlist);

  const getDictionary = () => {
    return watchHistory.reduce((dict: { [key: string]: number }, item) => {
      dict[item.mediaid] = item.progress;

      return dict;
    }, {});
  };

  return { saveItem, removeItem, hasItem, getPlaylist, getDictionary };
};
