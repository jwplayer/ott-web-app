import { useEffect } from 'react';

export const useWatchHistoryListener = (saveItem: () => void): void => {
  useEffect(() => {
    const visibilityListener = () => document.visibilityState === 'hidden' && saveItem();
    window.addEventListener('beforeunload', saveItem);
    window.addEventListener('visibilitychange', visibilityListener);

    return () => {
      saveItem();
      window.removeEventListener('beforeunload', saveItem);
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, []);
};
