import { getMediaItems } from '#src/stores/AccountController';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { PlaylistItem } from '#types/playlist';
import type { SerializedWatchHistoryItem, WatchHistoryItem } from '#types/watchHistory';
import { MAX_WATCHLIST_ITEMS_COUNT } from '#src/config';
import { getIntegration } from '#src/integration';
import * as watchHistoryService from '#src/services/watchHistory.service';

export const restoreWatchHistory = async () => {
  const continueWatchingList = useConfigStore.getState().config.features?.continueWatchingList;
  const integration = getIntegration();

  const savedItems = integration ? await integration.getWatchHistory() : await watchHistoryService.getWatchHistory();

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
      continueWatchingPlaylistId: continueWatchingList,
    });
  }
};

export const serializeWatchHistory = (watchHistory: WatchHistoryItem[]): SerializedWatchHistoryItem[] => {
  return watchHistory.map(({ mediaid, progress }) => ({
    mediaid,
    progress,
  }));
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
  const integration = getIntegration();
  const { watchHistory } = useWatchHistoryStore.getState();

  if (!videoProgress) return;

  const watchHistoryItem = createWatchHistoryItem(item, videoProgress);

  const updatedHistory = watchHistory.filter(({ mediaid }) => mediaid !== watchHistoryItem.mediaid);
  updatedHistory.unshift(watchHistoryItem);

  integration ? await integration.saveWatchHistory(item, videoProgress) : await watchHistoryService.saveWatchHistory(item, videoProgress);

  // limit watch history items
  const deletedItems = updatedHistory.splice(MAX_WATCHLIST_ITEMS_COUNT);

  // persist deleted items
  deletedItems.forEach((item) => {
    if (item.playlistItem) {
      integration ? integration.removeWatchHistory(item.playlistItem) : watchHistoryService.removeWatchHistory(item.playlistItem);
    }
  });

  useWatchHistoryStore.setState({ watchHistory: updatedHistory });
};
