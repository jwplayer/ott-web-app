import { useAccountStore } from '#src/stores/AccountStore';
import * as persist from '#src/utils/persist';
import { getMediaItems, updatePersonalShelves } from '#src/stores/AccountController';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { PlaylistItem } from '#types/playlist';
import type { SerializedWatchHistoryItem, WatchHistoryItem } from '#types/watchHistory';
import { MAX_WATCHLIST_ITEMS_COUNT } from '#src/config';

const PERSIST_KEY_WATCH_HISTORY = `history${window.configId ? `-${window.configId}` : ''}`;

export const restoreWatchHistory = async () => {
  const { user } = useAccountStore.getState();
  const continueWatchingList = useConfigStore.getState().config.features?.continueWatchingList;

  const savedItems = user ? user.externalData?.history : persist.getItem<WatchHistoryItem[]>(PERSIST_KEY_WATCH_HISTORY);

  if (savedItems?.length && continueWatchingList) {
    const watchHistoryItems = await getMediaItems(
      continueWatchingList,
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
    return updatePersonalShelves();
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
export const saveItem = async (item: PlaylistItem, videoProgress: number | null) => {
  const { watchHistory } = useWatchHistoryStore.getState();

  if (!videoProgress) return;

  const watchHistoryItem = createWatchHistoryItem(item, videoProgress);

  const updatedHistory = watchHistory.filter(({ mediaid }) => mediaid !== watchHistoryItem.mediaid);
  updatedHistory.unshift(watchHistoryItem);
  updatedHistory.splice(MAX_WATCHLIST_ITEMS_COUNT);

  useWatchHistoryStore.setState({ watchHistory: updatedHistory });

  await persistWatchHistory();
};
