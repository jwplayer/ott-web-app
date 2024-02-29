import { Navigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { buildLegacySeriesUrlFromMediaItem, mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { useSeriesLookup } from '@jwp/ott-hooks-react/src/series/useSeriesLookup';
import useMedia from '@jwp/ott-hooks-react/src/useMedia';

import type { ScreenComponent } from '../../../../../types/screens';
import Loading from '../../../Loading/Loading';

/**
 * This media series episode screen is used to redirect an episode item to the series page.
 */
const MediaEpisode: ScreenComponent<PlaylistItem> = ({ data: media, isLoading: isMediaLoading }) => {
  const mediaId = media.mediaid;
  const [searchParams] = useSearchParams();

  const play = searchParams.get('play') === '1';
  const feedId = searchParams.get('r');

  const { data: episodeInSeries, isLoading: isSeriesIdLoading } = useSeriesLookup(media.mediaid);
  const { isLoading: isSeriesMediaLoading, data: seriesMedia } = useMedia(episodeInSeries?.series_id || '');

  // Prevent rendering multiple times when we are loading data
  if (isMediaLoading || isSeriesIdLoading || isSeriesMediaLoading) {
    return <Loading />;
  }

  if (!episodeInSeries) {
    return <Navigate to={buildLegacySeriesUrlFromMediaItem(media, play, feedId)} replace />;
  }

  // Use media episode item for legacy series flow
  return <Navigate to={mediaURL({ episodeId: mediaId, media: seriesMedia as PlaylistItem, play, playlistId: feedId })} replace />;
};

export default MediaEpisode;
