import { Navigate } from 'react-router';

import type { ScreenComponent } from '#types/screens';
import type { PlaylistItem } from '#types/playlist';
import Loading from '#src/pages/Loading/Loading';
import { seriesURL } from '#src/utils/formatting';
import useQueryParam from '#src/hooks/useQueryParam';
import useGetSeriesId from '#src/hooks/series/useSeriesId';

/**
 * This media series episode screen is used to redirect a series linking media item to the series page.
 */
const MediaSeriesEpisode: ScreenComponent<PlaylistItem> = ({ data: media, isLoading: isMediaLoading }) => {
  const mediaId = media.mediaid;

  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  const { isLoading: isSeriesIdLoading, seriesId } = useGetSeriesId(media);

  // Prevent rendering the SeriesRedirect multiple times when we are loading data
  if (isMediaLoading || isSeriesIdLoading) {
    return <Loading />;
  }

  // According to the new approach we use mediaId as a seriesId
  return <Navigate to={seriesURL({ episodeId: mediaId, seriesId: seriesId || mediaId, play, playlistId: feedId })} replace />;
};

export default MediaSeriesEpisode;
