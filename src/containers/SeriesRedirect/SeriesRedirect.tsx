import { Navigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useSeriesData } from '#src/hooks/series/useSeriesData';
import useQueryParam from '#src/hooks/useQueryParam';
import { episodeURL } from '#src/utils/formatting';
import Loading from '#src/pages/Loading/Loading';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { useEpisodes } from '#src/hooks/series/useEpisodes';
import useMedia from '#src/hooks/useMedia';
import type { Playlist, PlaylistItem } from '#types/playlist';
import type { EpisodesWithPagination } from '#types/series';

/** Get episode to redirect to MediaSeriesEpisodePage */
const getEpisodeToRedirect = (
  episodeId: string | undefined,
  seriesPlaylist: Playlist,
  episodeData: PlaylistItem | undefined,
  episodesData: EpisodesWithPagination[] | undefined,
  isNewSeriesFlow: boolean,
) => {
  if (isNewSeriesFlow) {
    // For the new flow we return either a selected episode (Continue Watching) or just first available one
    return episodeData || episodesData?.[0]?.episodes?.[0];
  }

  // For the old approach we do the same thing, the only thing here that our playlist already have all the episodes inside
  if (!episodeId) {
    return seriesPlaylist.playlist[0];
  }

  return seriesPlaylist.playlist.find(({ mediaid }) => mediaid === episodeId);
};

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
  const { series, playlist: seriesPlaylist } = data || {};

  const { data: episode, isLoading: isEpisodeLoading } = useMedia(episodeId || '');
  // Only request list of episodes if we have no episode provided for the new flow
  const { data: episodesData, isLoading: isEpisodesLoading } = useEpisodes(mediaId, '0', { enabled: !!series && !episodeId });

  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  if (isLoading || isEpisodesLoading || isEpisodeLoading) {
    return <Loading />;
  }

  const toEpisode = getEpisodeToRedirect(episodeId, seriesPlaylist, episode, episodesData, !!series);

  if (isPlaylistError || !seriesPlaylist || !toEpisode) {
    return <ErrorPage title={t('series_error')} />;
  }

  // According to the new approach we use mediaId as a seriesId
  return <Navigate to={episodeURL({ episode: toEpisode, seriesId: series ? mediaId : seriesId, play, playlistId: feedId })} replace />;
};

export default SeriesRedirect;
