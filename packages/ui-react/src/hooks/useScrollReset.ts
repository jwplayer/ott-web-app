import { useEffect } from 'react';

export default function useScrollReset(id: string) {
  useEffect(() => {
    (document.scrollingElement || document.body).scroll({ top: 0 });
    (document.querySelector('#video-details button') as HTMLElement)?.focus();
  }, [id]);
}
