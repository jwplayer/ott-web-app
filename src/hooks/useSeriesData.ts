import usePlaylist from '#src/hooks/usePlaylist';
import useSeries from '#src/hooks/useSeries';
import type { Playlist } from '#types/playlist';
import type { Series } from '#types/series';

const DEFAULT_DATA = { title: '', playlist: [] };

type Data = {
  seriesPlaylist: Playlist;
  series: Series | undefined;
};

export const useSeriesData = (
  entityId?: string,
): {
  data: Data;
  // isItemError: boolean;
  isPlaylistError: boolean;
  isLoading: boolean;
} => {
  const { data: seriesData, isLoading: isSeriesLoading, error: seriesError, isError: isSeriesError } = useSeries(entityId);

  const usePlaylistFallback = isSeriesError && seriesError?.code === 404;
  // We enable it only after new series api unsuccessful load (404 error showing that such the series with the following id doesn't exist)
  const { data: playlistData, isLoading: isPlaylistLoading, error: playlistError } = usePlaylist(entityId, {}, usePlaylistFallback, false);

  const seriesPlaylist = seriesData?.playlist || playlistData || DEFAULT_DATA;

  return {
    data: { seriesPlaylist, series: seriesData?.series },
    isPlaylistError: Boolean(seriesError && playlistError),
    isLoading: isSeriesLoading || isPlaylistLoading,
  };
};
