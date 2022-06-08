import { useAccountStore } from '#src/stores/AccountStore';
import * as persist from '#src/utils/persist';
import { getMediaItems, updatePersonalShelves } from '#src/stores/AccountController';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { PlaylistItem } from '#types/playlist';
import type { WatchHistoryItem, SerializedWatchHistoryItem } from '#types/watchHistory';
import { MAX_WATCHLIST_ITEMS_COUNT } from '#src/constants/watchlist';

const PERSIST_KEY_WATCH_HISTORY = `history${window.configId ? `-${window.configId}` : ''}`;

export const restoreWatchHistory = async () => {
  const { user } = useAccountStore.getState();
  const continue_watching_list = useConfigStore.getState().config.features?.continue_watching_list;

  const savedItems = user ? user.externalData?.history : persist.getItem<WatchHistoryItem[]>(PERSIST_KEY_WATCH_HISTORY);

  if (savedItems?.length && continue_watching_list) {
    const watchHistoryItems = await getMediaItems(
      continue_watching_list,
      savedItems.map(({ mediaid }) => mediaid),
    );

    const watchHistoryItemsDict = Object.fromEntries((watchHistoryItems || []).map((item) => [item.mediaid, item]));

    const watchHistory = savedItems.map((item) => {
      if (watchHistoryItemsDict[item.mediaid]) {
        return createWatchHistoryItem(watchHistoryItemsDict[item.mediaid], item.progress);
      }
    });

    useWatchHistoryStore.setState({
      watchHistory: watchHistory.filter((item): item is WatchHistoryItem => !!item?.mediaid),
      playlistItemsLoaded: true,
    });
  }
};

export const serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] => {
  return watchHistory.map(({ mediaid, progress }) => ({
    mediaid,
    progress,
  }));
};

export const persistWatchHistory = () => {
  const { watchHistory } = useWatchHistoryStore.getState();
  const { user } = useAccountStore.getState();

  if (user) {
    updatePersonalShelves();
  }

  persist.setItem(PERSIST_KEY_WATCH_HISTORY, serializeWatchHistory(watchHistory));
};

export const createWatchHistoryItem = (item: PlaylistItem, videoProgress: number): WatchHistoryItem => {
  return {
    mediaid: item.mediaid,
    title: item.title,
    tags: item.tags,
    duration: item.duration,
    progress: videoProgress,
    playlistItem: item,
  } as WatchHistoryItem;
};

/**
 *  If we already have an element with continue watching state, we:
 *    1. Update the progress
 *    2. Move the element to the continue watching list start
 *  Otherwise:
 *    1. Move the element to the continue watching list start
 *    2. If there are many elements in continue watching state we remove the oldest one
 */
export const saveItem = (item: PlaylistItem, videoProgress: number | null) => {
  const { watchHistory } = useWatchHistoryStore.getState();

  if (!videoProgress) return;

  const watchHistoryItem = createWatchHistoryItem(item, videoProgress);
  const index = watchHistory.findIndex(({ mediaid }) => mediaid === watchHistoryItem.mediaid);

  let updatedHistory = watchHistory;

  if (index > -1) {
    updatedHistory = [watchHistoryItem, ...watchHistory.filter(({ mediaid }) => mediaid !== watchHistoryItem.mediaid)];
  } else {
    updatedHistory = [watchHistoryItem, ...watchHistory];
    if (watchHistory.length > MAX_WATCHLIST_ITEMS_COUNT) {
      updatedHistory = updatedHistory.slice(0, watchHistory.length - 1);
    }
  }

  useWatchHistoryStore.setState({ watchHistory: updatedHistory });

  persistWatchHistory();
};

export const removeItem = (item: PlaylistItem) => {
  const { watchHistory } = useWatchHistoryStore.getState();

  useWatchHistoryStore.setState({
    watchHistory: watchHistory.filter(({ mediaid }) => mediaid !== item.mediaid),
  });

  persistWatchHistory();
};
