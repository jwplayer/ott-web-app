import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useSeriesData } from '#src/hooks/useSeriesData';
import useQueryParam from '#src/hooks/useQueryParam';
import { episodeURL } from '#src/utils/formatting';
import Loading from '#src/pages/Loading/Loading';
import ErrorPage from '#components/ErrorPage/ErrorPage';

type Props = {
  seriesId: string;
  episodeId?: string;
};

/**
 * This container is mainly used to redirect the user to the correct episode media age.
 *
 * It fetches the series and redirects to the first episode. This behavior can be overridden when passing the
 * `episodeId` argument.
 *
 * Later, the watch history can also be used to determine the last watched episode to properly support continue
 * watching with series.
 */
const SeriesRedirect = ({ seriesId, episodeId }: Props) => {
  const { t } = useTranslation('video');
  const { isLoading, isPlaylistError, data } = useSeriesData(seriesId);
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  if (isLoading) {
    return <Loading />;
  }

  if (isPlaylistError || !data) {
    return <ErrorPage title={t('series_error')} />;
  }

  const firstEpisode = data.seriesPlaylist.playlist[0];
  const toEpisode = episodeId ? data.seriesPlaylist.playlist.find(({ mediaid }) => mediaid === episodeId) : firstEpisode;

  if (!toEpisode) {
    return <ErrorPage title={t('episode_not_found')} />;
  }

  return <Navigate to={episodeURL(toEpisode, seriesId, play, feedId)} replace />;
};

export default SeriesRedirect;
