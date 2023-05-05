import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useSeriesData } from '#src/hooks/series/useSeriesData';
import useQueryParam from '#src/hooks/useQueryParam';
import { episodeURL } from '#src/utils/formatting';
import { getEpisodeToRedirect } from '#src/utils/series';
import Loading from '#src/pages/Loading/Loading';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { useSeriesEpisodes } from '#src/hooks/series/useEpisodes';

type Props = {
  seriesId: string;
  episodeId?: string;
  mediaId?: string;
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
const SeriesRedirect = ({ seriesId, episodeId, mediaId }: Props) => {
  const { t } = useTranslation('video');

  const { isLoading, isPlaylistError, data } = useSeriesData(seriesId, mediaId);
  const { series, seriesPlaylist } = data || {};

  const { data: episodesData, isLoading: isEpisodesLoading } = useSeriesEpisodes(mediaId, !!series);

  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  if (isLoading || isEpisodesLoading) {
    return <Loading />;
  }

  const toEpisode = getEpisodeToRedirect(episodeId, seriesPlaylist, !!data.series, episodesData?.pages);

  if (isPlaylistError || !seriesPlaylist || !toEpisode) {
    return <ErrorPage title={t('series_error')} />;
  }

  // According to the new approach we use mediaId as a seriesId
  return <Navigate to={episodeURL({ episode: toEpisode, seriesId: series ? mediaId : seriesId, play, playlistId: feedId })} replace />;
};

export default SeriesRedirect;
