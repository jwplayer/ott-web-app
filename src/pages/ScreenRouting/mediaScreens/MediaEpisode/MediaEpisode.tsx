import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import type { ScreenComponent } from '#types/screens';
import type { PlaylistItem } from '#types/playlist';
import Loading from '#src/pages/Loading/Loading';
import { deprecatedSeriesURL, mediaURL } from '#src/utils/formatting';
import useQueryParam from '#src/hooks/useQueryParam';
import useGetSeriesId from '#src/hooks/series/useSeriesId';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { useSeriesData } from '#src/hooks/series/useSeriesData';

/**
 * This media series episode screen is used to redirect an episode item to the series page.
 */
const MediaEpisode: ScreenComponent<PlaylistItem> = ({ data: media, isLoading: isMediaLoading }) => {
  const mediaId = media.mediaid;

  const { t } = useTranslation('video');
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  const { deprecatedPlaylistId, seriesId, isLoading: isSeriesIdLoading } = useGetSeriesId(media);
  const {
    isLoading: isSeriesLoading,
    data: { series, media: seriesMedia },
    isPlaylistError,
  } = useSeriesData(deprecatedPlaylistId, seriesId);

  // Prevent rendering the SeriesRedirect multiple times when we are loading data
  if (isMediaLoading || isSeriesLoading || isSeriesIdLoading) {
    return <Loading />;
  }

  if (isPlaylistError) {
    return <ErrorPage title={t('series_error')} />;
  }

  if (!series) {
    return <Navigate to={deprecatedSeriesURL({ episodeId: mediaId, seriesId: deprecatedPlaylistId as string, play, playlistId: feedId })} replace />;
  }

  return <Navigate to={mediaURL({ episodeId: mediaId, media: seriesMedia as PlaylistItem, play, playlistId: feedId })} replace />;
};

export default MediaEpisode;
