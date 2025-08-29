import useQueryParam from '@jwp/ott-ui-react-next/src/hooks/useQueryParam';
import { usePathname } from 'next/navigation';

export default function useMovieParams() {
  const pathname = usePathname();
  const id = pathname?.split('/')[2] || '';
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  return {
    id,
    play,
    feedId,
  };
}
