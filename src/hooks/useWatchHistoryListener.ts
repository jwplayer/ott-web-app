import { useEffect } from 'react';

import useEventCallback from '#src/hooks/useEventCallback';

export const useWatchHistoryListener = (saveItem: () => void): void => {
  const saveItemEvent = useEventCallback(saveItem);

  useEffect(() => {
    const visibilityListener = () => document.visibilityState === 'hidden' && saveItemEvent();
    window.addEventListener('beforeunload', saveItemEvent);
    window.addEventListener('visibilitychange', visibilityListener);

    return () => {
      saveItemEvent();
      window.removeEventListener('beforeunload', saveItemEvent);
      window.removeEventListener('visibilitychange', visibilityListener);
    };
  }, [saveItemEvent]);
};
