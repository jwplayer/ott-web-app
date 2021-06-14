import { Store } from 'pullstate';
import { useEffect } from 'react';
import type { WatchHistoryItem } from 'types/watchHistory';

import * as persist from '../utils/persist';

const PERSIST_KEY_WATCH_HISTORY = `watchhistory${window.configId ? `-${window.configId}` : ''}`;

type WatchHistoryStore = {
  watchHistory: WatchHistoryItem[];
};

export const watchHistoryStore = new Store<WatchHistoryStore>({
  watchHistory: [],
});

export const initializeWatchHistory = () => {
  const localHistory = persist.getItem(PERSIST_KEY_WATCH_HISTORY);
  const watchHistory: WatchHistoryItem[] = localHistory ? (localHistory as WatchHistoryItem[]) : [];

  if (watchHistory) {
    watchHistoryStore.update((state) => {
      state.watchHistory = watchHistory;
    });
  }

  return watchHistoryStore.subscribe(
    (state) => state.watchHistory,
    (watchHistory) => persist.setItem(PERSIST_KEY_WATCH_HISTORY, watchHistory),
  );
};

export const useWatchHistoryUpdater = (
  createWatchHistoryItem: () => WatchHistoryItem | undefined,
  enabled: boolean = true,
): void => {
  if (!enabled) return;

  useEffect(() => {
    const savePosition = () => {
      const { watchHistory } = watchHistoryStore.getRawState();
      const item = createWatchHistoryItem();
      if (!item) return;

      const index = watchHistory.findIndex((historyItem) => historyItem.mediaid === item.mediaid);
      if (index > -1) {
        watchHistoryStore.update((state) => {
          state.watchHistory[index] = item;
        });
      } else {
        watchHistoryStore.update((state) => {
          state.watchHistory.push(item);
        });
      }
    };
    const visibilityListener = () => document.visibilityState === 'hidden' && savePosition();

    window.addEventListener('beforeunload', savePosition);
    window.addEventListener('visibilitychange', visibilityListener);

    return () => {
      savePosition();
      window.removeEventListener('beforeunload', savePosition);
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, []);
};
