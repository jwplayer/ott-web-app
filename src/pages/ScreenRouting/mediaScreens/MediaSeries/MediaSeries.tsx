import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import type { ScreenComponent } from '#types/screens';
import type { PlaylistItem } from '#types/playlist';
import { useSeriesData } from '#src/hooks/useSeriesData';
import useQueryParam from '#src/hooks/useQueryParam';
import { episodeURL } from '#src/utils/formatting';
import Loading from '#src/pages/Loading/Loading';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { getSeriesIdFromCustomParams } from '#src/utils/media';

/**
 * This container is mainly used to redirect the user to the correct episode media page.
 *
 * It fetches the series and redirects to the first episode.
 *
 * Later, the watch history can also be used to determine the last watched episode to properly support continue
 * watching with series.
 */
const MediaSeries: ScreenComponent<PlaylistItem> = ({ data: media, isLoading: isFetchingMedia }) => {
  const seriesId = getSeriesIdFromCustomParams(media);
  const mediaId = media.mediaid;

  const { t } = useTranslation('video');

  const { isLoading, isPlaylistError, data } = useSeriesData(seriesId, mediaId);
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  if (isLoading || isFetchingMedia) {
    return <Loading />;
  }

  if (isPlaylistError || !data) {
    return <ErrorPage title={t('series_error')} />;
  }

  const toEpisode = data.seriesPlaylist.playlist[0];

  if (!toEpisode) {
    return <ErrorPage title={t('episode_not_found')} />;
  }

  return <Navigate to={episodeURL({ episode: toEpisode, seriesId: seriesId || mediaId, mediaId, play, playlistId: feedId })} replace />;
};

export default MediaSeries;
