import usePlaylist from '#src/hooks/usePlaylist';
import useSeries from '#src/hooks/series/useSeries';
import type { Playlist, PlaylistItem } from '#types/playlist';
import type { Series } from '#types/series';

const DEFAULT_DATA = { title: '', playlist: [] };

type Data = {
  playlist: Playlist;
  newSeries: { series: Series | undefined; media: PlaylistItem | undefined };
};

export const useSeriesData = (
  seriesId: string | undefined,
  mediaid: string | undefined,
): {
  data: Data;
  isPlaylistError: boolean;
  isLoading: boolean;
} => {
  const { data: seriesData, isLoading: isSeriesLoading, error: seriesError, isError: isSeriesError } = useSeries(mediaid);

  const usePlaylistFallback = isSeriesError && seriesError?.code === 404;
  // We enable it only after new series api unsuccessful load (404 error showing that such the series with the following id doesn't exist)
  const { data: playlistData, isLoading: isPlaylistLoading, error: playlistError } = usePlaylist(seriesId, {}, usePlaylistFallback, false);

  const seriesPlaylist = seriesData?.playlist || playlistData || DEFAULT_DATA;

  return {
    data: { playlist: seriesPlaylist, newSeries: { series: seriesData?.series, media: seriesData?.media } },
    isPlaylistError: Boolean(seriesError && playlistError),
    isLoading: isSeriesLoading || isPlaylistLoading,
  };
};
