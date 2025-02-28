import { useParams } from 'react-router';
import useQueryParam from '@jwp/ott-ui-react/src/hooks/useQueryParam';

export default function useMovieParams() {
  const params = useParams();
  const id = params.id || '';
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  return {
    id,
    play,
    feedId,
  };
}
