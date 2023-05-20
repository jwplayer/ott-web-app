import * as persist from '#src/utils/persist';
import type { PlaylistItem } from '#types/playlist';
import type { SerializedWatchHistoryItem } from '#types/watchHistory';

const PERSIST_KEY_WATCH_HISTORY = `watchhistory${window.configId ? `-${window.configId}` : ''}`;

export const saveWatchHistory = async (item: PlaylistItem, progress: number) => {
  const watchHistory = await getWatchHistory();
  const updatedWatchHistory = [{ mediaid: item.mediaid, progress }, ...watchHistory];

  persist.setItem(PERSIST_KEY_WATCH_HISTORY, updatedWatchHistory);

  return updatedWatchHistory;
};

export const removeWatchHistory = async (item: PlaylistItem) => {
  const watchHistory = await getWatchHistory();
  const updatedWatchHistory = watchHistory.filter(({ mediaid }) => mediaid !== item.mediaid);

  persist.setItem(PERSIST_KEY_WATCH_HISTORY, updatedWatchHistory);

  return updatedWatchHistory;
};

export const clearWatchHistory = async () => {
  persist.setItem(PERSIST_KEY_WATCH_HISTORY, []);
};

export const getWatchHistory = async () => {
  const watchHistory = persist.getItem<SerializedWatchHistoryItem[]>(PERSIST_KEY_WATCH_HISTORY) || [];

  return watchHistory || [];
};
