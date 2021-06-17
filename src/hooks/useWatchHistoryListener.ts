import { useEffect } from 'react';

type WatchHistoryListenerReturn = {
  removeListener: () => void;
};

export const useWatchHistoryListener = (saveItem: () => void): WatchHistoryListenerReturn => {
  let listen = true;
  const visibilityListener = () => document.visibilityState === 'hidden' && saveItem();

  useEffect(() => {
    window.addEventListener('beforeunload', saveItem);
    window.addEventListener('visibilitychange', visibilityListener);

    return () => {
      if (listen) saveItem();
      window.removeEventListener('beforeunload', saveItem);
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, []);
  const removeListener = () => {
    listen = false;
    window.removeEventListener('beforeunload', saveItem);
    window.removeEventListener('visibilitychange', visibilityListener);
  };

  return { removeListener };
};
