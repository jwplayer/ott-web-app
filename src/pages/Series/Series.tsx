import { useParams } from 'react-router';

import SeriesRedirect from '#src/containers/SeriesRedirect/SeriesRedirect';
import useQueryParam from '#src/hooks/useQueryParam';

/**
 * This route redirects the legacy `/s/:id/*` route. The `id` param is always a playlist or series id.
 */
const Series = () => {
  const { id } = useParams();
  const episodeId = useQueryParam('e');
  const seriesId = id || '';

  return <SeriesRedirect seriesId={seriesId} episodeId={episodeId} />;
};

export default Series;
