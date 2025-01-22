import { useEffect } from 'react';
import useEventCallback from '@jwp/ott-hooks-react/src/useEventCallback';

export const useScrolledDown = (start = 300, end = 30, onChange: (progress: number) => void) => {
  const handleScroll = useEventCallback(() => {
    const scrollTarget = document.scrollingElement || document.body;
    const scrollPosition = scrollTarget.scrollTop;
    const progress = Math.max(0, Math.min(1, (scrollPosition - start) / (end - start)));

    onChange(progress);
  });

  useEffect(() => {
    const { scrollingElement, documentElement, body } = document;
    const listenerElement = scrollingElement && scrollingElement !== documentElement && scrollingElement !== body ? scrollingElement : window;

    listenerElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      listenerElement.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
};
