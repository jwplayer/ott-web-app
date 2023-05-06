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
    // When item is an episode of the new flow -> show the card as a series one, but keep episode to redirect in a right way
    const ids = savedItems.map(({ mediaid, seriesId }) => seriesId || mediaid);
    const watchHistoryItems = await getMediaItems(continueWatchingList, ids);

    const watchHistoryItemsDict = Object.fromEntries((watchHistoryItems || []).map((item) => [item.mediaid, item]));

    const watchHistory = savedItems.map((item) => {
      const historyItem = watchHistoryItemsDict[item.seriesId || item.mediaid];

      if (historyItem) {
        return createWatchHistoryItem(historyItem, item.mediaid, item.seriesId, item.progress);
      }
    });

    useWatchHistoryStore.setState({
      watchHistory: watchHistory.filter((item): item is WatchHistoryItem => !!item?.mediaid),
      playlistItemsLoaded: true,
    });
  }
};

export const serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] =>
  watchHistory.map(({ mediaid, progress, seriesId }) => {
    if (seriesId) {
      return {
        mediaid,
        seriesId,
        progress,
      };
    }

    return {
      mediaid,
      progress,
    };
  });

export const persistWatchHistory = () => {
  const { watchHistory } = useWatchHistoryStore.getState();
  const { user } = useAccountStore.getState();

  if (user) {
    return updatePersonalShelves();
  }

  persist.setItem(PERSIST_KEY_WATCH_HISTORY, serializeWatchHistory(watchHistory));
};

/** Use mediaid of originally watched movie / episode.
 * A playlistItem can be either a series item (to show series card) or media item
 * */
export const createWatchHistoryItem = (item: PlaylistItem, mediaid: string, seriesId: string | undefined, videoProgress: number): WatchHistoryItem => {
  return {
    mediaid,
    seriesId,
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
  const continueWatchingList = useConfigStore.getState().config.features?.continueWatchingList;
  let seriesItem;

  if (!videoProgress) return;

  if (item.seriesId) {
    // For episodes of the new series flow we store series information, so let's retrieve it first
    try {
      seriesItem = (await getMediaItems(continueWatchingList, [item.seriesId]))?.[0];
    } catch {
      // For the old approach we just save the episode as before
    }
  }

  const watchHistoryItem = createWatchHistoryItem(seriesItem || item, item.mediaid, item.seriesId, videoProgress);
  const updatedHistory = watchHistory.filter(({ mediaid, seriesId }) => mediaid !== watchHistoryItem.mediaid && seriesId !== watchHistoryItem.seriesId);

  updatedHistory.unshift(watchHistoryItem);
  updatedHistory.splice(MAX_WATCHLIST_ITEMS_COUNT);

  useWatchHistoryStore.setState({ watchHistory: updatedHistory });

  await persistWatchHistory();
};
