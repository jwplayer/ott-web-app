/**
 *
 * Service to persist either locally or remotely
 * To localStorage or API
 *
 */

import type { WatchHistoryItem } from '../store/WatchHistoryStore';

const LOCAL_STORAGE_KEY_WATCH_HISTORY = `watchhistory${window.configId ? `-${window.configId}` : ''}`;

const setItem = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error: unknown) {
    console.error(error);
  }
};

const getItem = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch (error: unknown) {
    console.error(error);
  }
};

const parseJSON = (value?: string | null): unknown[] | undefined => {
  if (!value) return;
  try {
    const ret = JSON.parse(value);

    return ret;
  } catch (error: unknown) {
    return;
  }
};

const loadWatchHistory = (): WatchHistoryItem[] => {
  const localHistory = parseJSON(getItem(LOCAL_STORAGE_KEY_WATCH_HISTORY));
  const watchHistory: WatchHistoryItem[] = localHistory ? (localHistory as WatchHistoryItem[]) : [];
  return watchHistory;
};

const storeWatchHistory = (watchHistory: WatchHistoryItem[]): void => {
  setItem(LOCAL_STORAGE_KEY_WATCH_HISTORY, JSON.stringify(watchHistory));
};

export { loadWatchHistory, storeWatchHistory };
