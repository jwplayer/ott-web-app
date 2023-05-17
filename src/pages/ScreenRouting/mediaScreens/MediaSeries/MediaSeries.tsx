import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

import { seriesURL } from '#src/utils/formatting';
import { useSeriesData } from '#src/hooks/series/useSeriesData';
import ErrorPage from '#components/ErrorPage/ErrorPage';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { PlaylistItem } from '#types/playlist';
import type { ScreenComponent } from '#types/screens';
import useQueryParam from '#src/hooks/useQueryParam';
import Loading from '#src/pages/Loading/Loading';
import { getSeriesPlaylistIdFromCustomParams } from '#src/utils/media';

/**
 * This media series screen is used to redirect a series linking media item to the series page.
 */
const MediaSeries: ScreenComponent<PlaylistItem> = ({ data: media, isLoading: isMediaLoading }) => {
  const { t } = useTranslation('video');
  const play = useQueryParam('play') === '1';
  const feedId = useQueryParam('r');

  const mediaId = media.mediaid;

  const legacySeriesPlaylistId = getSeriesPlaylistIdFromCustomParams(media) || '';
  const { isLoading: isSeriesLoading, isPlaylistError, data } = useSeriesData(legacySeriesPlaylistId, mediaId);
  const { series, playlist: seriesPlaylist } = data || {};

  // Retrieve watch history for new flow and find an episode of the selected series (if present)
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.watchHistory);
  const episodeInProgress = watchHistoryDictionary.find((episode) => episode?.seriesId === mediaId);

  if (isSeriesLoading || isMediaLoading) {
    return <Loading />;
  }

  if (isPlaylistError || !seriesPlaylist) {
    return <ErrorPage title={t('series_error')} />;
  }

  // According to the new approach we use mediaId as a seriesId
  return (
    <Navigate
      to={seriesURL({ episodeId: episodeInProgress?.mediaid, seriesId: series ? mediaId : legacySeriesPlaylistId, play, playlistId: feedId })}
      replace
    />
  );
};

export default MediaSeries;
