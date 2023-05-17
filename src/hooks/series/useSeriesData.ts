import { useQuery, UseQueryResult } from 'react-query';

import usePlaylist from '#src/hooks/usePlaylist';
import type { Playlist, PlaylistItem } from '#types/playlist';
import type { Series, SeriesData } from '#types/series';
import { getMediaById, getSeries } from '#src/services/api.service';
import type { ApiError } from '#src/utils/api';

const DEFAULT_DATA = { title: '', playlist: [] };

export const useSeriesData = (
  legacySeriesPlaylistId: string | undefined,
  seriesId: string | undefined,
): {
  data: SeriesData;
  isPlaylistError: boolean;
  isLoading: boolean;
} => {
  // Try to get new series flow data
  const {
    data: seriesData,
    isLoading: isSeriesLoading,
    error: seriesError,
    isError: isSeriesError,
  }: UseQueryResult<{ series: Series; media: PlaylistItem; playlist: Playlist }, ApiError> = useQuery(
    ['series', seriesId],
    async () => {
      const [series, media] = await Promise.all([getSeries(seriesId || ''), getMediaById(seriesId || '')]);

      return {
        series,
        media,
        playlist: { playlist: [], title: media?.title, description: media?.description, feedid: media?.series_id },
      };
    },
    {
      enabled: !!seriesId,
      // 8 hours
      staleTime: 60 * 1000 * 60 * 8,
      // Don't retry when we got a not found error from either series or media item request (prevent unneeded requests)
      // Both errors mean that old series flow should be used
      retry: (failureCount, error: ApiError) => error.code !== 404 && failureCount < 2,
    },
  );

  const usePlaylistFallback = isSeriesError && seriesError?.code === 404;

  // We enable it only after new series api unsuccessful load (404 error showing that such the series with the following id doesn't exist)
  const { data: playlistData, isLoading: isPlaylistLoading, isError: isPlaylistError } = usePlaylist(legacySeriesPlaylistId, {}, usePlaylistFallback, false);

  const seriesPlaylist = seriesData?.playlist || playlistData || DEFAULT_DATA;

  return {
    data: {
      playlist: seriesPlaylist,
      series: seriesData?.series,
      media: seriesData?.media,
      contentType: seriesData?.media?.contentType || playlistData?.contentType,
    },
    isPlaylistError,
    isLoading: isSeriesLoading || isPlaylistLoading,
  };
};
