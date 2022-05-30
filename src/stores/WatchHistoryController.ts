import { useAccountStore } from '#src/stores/AccountStore';
import * as persist from '#src/utils/persist';
import { getMediaItems, updatePersonalShelves } from '#src/stores/AccountController';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { PlaylistItem } from '#types/playlist';
import type { WatchHistoryItem } from '#types/watchHistory';
import type { VideoProgress } from '#types/video';

const PERSIST_KEY_WATCH_HISTORY = `history${window.configId ? `-${window.configId}` : ''}`;

export const restoreWatchHistory = async () => {
  const { user } = useAccountStore.getState();

  const savedItems = user ? user.externalData?.history : persist.getItem<WatchHistoryItem[]>(PERSIST_KEY_WATCH_HISTORY);

  if (savedItems) {
    // Store savedItems immediately, so we can show the watch history while we fetch the mediaItems
    useWatchHistoryStore.setState({ watchHistory: savedItems });

    const watchHistoryItems = await getMediaItems(savedItems.map((item) => item.mediaid));
    const watchHistoryItemsDict = Object.fromEntries(watchHistoryItems.map((item) => [item.mediaid, item]));

    const watchHistory = savedItems.map((item) => {
      if (watchHistoryItemsDict[item.mediaid]) {
        return createWatchHistoryItem(watchHistoryItemsDict[item.mediaid], {
          progress: item.progress,
          duration: item.duration,
        });
      }
    });

    useWatchHistoryStore.setState({
      watchHistory: watchHistory.filter((item): item is WatchHistoryItem => !!item?.mediaid),
      playlistItemsLoaded: true,
    });
  }
};

export const serializeWatchHistory = (watchHistory: WatchHistoryItem[]) => {
  return watchHistory.map(({ mediaid, title, tags, duration, progress }) => ({
    mediaid,
    title,
    tags,
    duration,
    progress,
  }));
};

export const persistWatchHistory = () => {
  const { watchHistory } = useWatchHistoryStore.getState();
  const { user } = useAccountStore.getState();

  if (user) {
    return updatePersonalShelves();
  }

  return persist.setItem(PERSIST_KEY_WATCH_HISTORY, serializeWatchHistory(watchHistory));
};

export const createWatchHistoryItem = (item: PlaylistItem, videoProgress: VideoProgress): WatchHistoryItem => {
  return {
    mediaid: item.mediaid,
    title: item.title,
    tags: item.tags,
    duration: videoProgress.duration,
    progress: videoProgress.progress,
    playlistItem: item,
  } as WatchHistoryItem;
};

export const saveItem = (item: PlaylistItem, videoProgress: VideoProgress | null) => {
  const { watchHistory } = useWatchHistoryStore.getState();

  if (!videoProgress) return;

  const watchHistoryItem = createWatchHistoryItem(item, videoProgress);
  const index = watchHistory.findIndex(({ mediaid }) => mediaid === watchHistoryItem.mediaid);

  if (index > -1) {
    watchHistory[index] = watchHistoryItem;
    useWatchHistoryStore.setState({ watchHistory });
  } else {
    useWatchHistoryStore.setState({ watchHistory: [watchHistoryItem].concat(watchHistory) });
  }

  persistWatchHistory();
};

export const removeItem = (item: PlaylistItem) => {
  const { watchHistory } = useWatchHistoryStore.getState();

  useWatchHistoryStore.setState({
    watchHistory: watchHistory.filter(({ mediaid }) => mediaid !== item.mediaid),
  });

  persistWatchHistory();
};
