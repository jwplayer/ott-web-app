import { Store } from 'pullstate';
import { useEffect } from 'react';

import * as persist from '../services/persist.service';

export type WatchHistoryItem = {
  mediaid: string;
  position: number;
};

type WatchHistoryStore = {
  watchHistory: WatchHistoryItem[];
};

export const WatchHistoryStore = new Store<WatchHistoryStore>({
  watchHistory: [],
});
WatchHistoryStore.subscribe(
  (state) => state.watchHistory,
  (watchHistory) => persist.storeWatchHistory(watchHistory),
);

export const loadWatchHistory = () => {
  const watchHistory = persist.loadWatchHistory();

  return (
    watchHistory &&
    WatchHistoryStore.update((state) => {
      state.watchHistory = watchHistory;
    })
  );
};

export const useWatchHistoryUpdater = (createWatchHistoryItem: () => WatchHistoryItem | undefined): void => {
  useEffect(() => {
    const savePosition = () => {
      const { watchHistory } = WatchHistoryStore.getRawState();
      const item = createWatchHistoryItem();
      if (!item) return;

      const index = watchHistory.findIndex((historyItem) => historyItem.mediaid === item.mediaid);
      if (index > -1) {
        WatchHistoryStore.update((state) => {
          state.watchHistory[index] = item;
        });
      } else {
        WatchHistoryStore.update((state) => {
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
