import { useAccountStore } from '#src/stores/AccountStore';
import * as persist from '#src/utils/persist';
import { getMediaItems, updatePersonalShelves } from '#src/stores/AccountController';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { PlaylistItem } from '#types/playlist';
import type { SerializedWatchHistoryItem, WatchHistoryItem } from '#types/watchHistory';
import { MAX_WATCHLIST_ITEMS_COUNT } from '#src/config';
import { getSeriesByMediaIds } from '#src/services/api.service';

const PERSIST_KEY_WATCH_HISTORY = `history${window.configId ? `-${window.configId}` : ''}`;

// Retrieve watch history media items info using a provided watch list
const getWatchHistoryItems = async (continueWatchingList: string, ids: string[]): Promise<Record<string, PlaylistItem>> => {
  const watchHistoryItems = await getMediaItems(continueWatchingList, ids);
  const watchHistoryItemsDict = Object.fromEntries((watchHistoryItems || []).map((item) => [item.mediaid, item]));

  return watchHistoryItemsDict;
};

// We store separate episodes in the watch history and to show series card in the Continue Watching shelf we need to get their parent media items
const getWatchHistorySeriesItems = async (continueWatchingList: string, ids: string[]): Promise<Record<string, PlaylistItem | undefined>> => {
  const mediaWithSeries = await getSeriesByMediaIds(ids);
  const seriesIds = Object.keys(mediaWithSeries || {})
    .map((key) => mediaWithSeries?.[key]?.[0]?.series_id)
    .filter(Boolean) as string[];

  const seriesItems = await getMediaItems(continueWatchingList, seriesIds);
  const seriesItemsDict = Object.keys(mediaWithSeries || {}).reduce((acc, key) => {
    const seriesItemId = mediaWithSeries?.[key]?.[0]?.series_id;
    if (seriesItemId) {
      acc[key] = seriesItems?.find((el) => el.mediaid === seriesItemId);
    }
    return acc;
  }, {} as Record<string, PlaylistItem | undefined>);

  return seriesItemsDict;
};

export const restoreWatchHistory = async () => {
  const { user } = useAccountStore.getState();
  const continueWatchingList = useConfigStore.getState().config.features?.continueWatchingList;

  const savedItems = user ? user.externalData?.history : persist.getItem<WatchHistoryItem[]>(PERSIST_KEY_WATCH_HISTORY);

  if (savedItems?.length && continueWatchingList) {
    // When item is an episode of the new flow -> show the card as a series one, but keep episode to redirect in a right way
    const ids = savedItems.map(({ mediaid }) => mediaid);

    const watchHistoryItems = await getWatchHistoryItems(continueWatchingList, ids);
    const seriesItems = await getWatchHistorySeriesItems(continueWatchingList, ids);

    const watchHistory = savedItems.map((item) => {
      const parentSeries = seriesItems?.[item.mediaid];
      const historyItem = watchHistoryItems[item.mediaid];

      if (historyItem) {
        return createWatchHistoryItem(parentSeries || historyItem, item.mediaid, parentSeries?.mediaid, item.progress);
      }
    });

    useWatchHistoryStore.setState({
      watchHistory: watchHistory.filter((item): item is WatchHistoryItem => !!item?.mediaid),
      playlistItemsLoaded: true,
      continueWatchingPlaylistId: continueWatchingList,
    });
  }
};

export const serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] =>
  watchHistory.map(({ mediaid, progress }) => ({
    mediaid,
    progress,
  }));

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
export const saveItem = async (item: PlaylistItem, seriesItem: PlaylistItem | undefined, videoProgress: number | null) => {
  const { watchHistory } = useWatchHistoryStore.getState();

  if (!videoProgress) return;

  const watchHistoryItem = createWatchHistoryItem(seriesItem || item, item.mediaid, seriesItem?.mediaid, videoProgress);
  // filter out the existing watch history item, so we can add it to the beginning of the list
  const updatedHistory = watchHistory.filter(({ mediaid, seriesId }) => {
    return mediaid !== watchHistoryItem.mediaid && (!seriesId || seriesId !== watchHistoryItem.seriesId);
  });

  updatedHistory.unshift(watchHistoryItem);

  updatedHistory.splice(MAX_WATCHLIST_ITEMS_COUNT);
  useWatchHistoryStore.setState({ watchHistory: updatedHistory });

  await persistWatchHistory();
};
