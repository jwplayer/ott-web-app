import usePlaylist from '#src/hooks/usePlaylist';
import useSeries from '#src/hooks/useSeries';
import useMedia from '#src/hooks/useMedia';
import type { ApiError } from '#src/utils/api';
import type { Playlist, PlaylistItem } from '#types/playlist';
import type { Series } from '#types/series';
import { getSeriesIdFromEpisode } from '#src/utils/media';
import { getNextItemId } from '#src/utils/series';

const DEFAULT_DATA = { title: '', playlist: [] };

const getData = (seriesData: { playlist: Playlist; series: Series } | undefined, playlistData: Playlist | undefined, seriesError: ApiError | null) => {
  if (seriesError?.code === 404) {
    return playlistData || DEFAULT_DATA;
  }

  return seriesData?.playlist || DEFAULT_DATA;
};

/** Current item we show on the Series page (we need to add episodeId and seasonId to be displayed properly) */
const enrichMediaItem = (mediaItems: PlaylistItem[], item: PlaylistItem | undefined): PlaylistItem | undefined => {
  if (!item) {
    return undefined;
  }

  const mediaItem = mediaItems.find((el) => el.mediaid === item?.mediaid) as PlaylistItem;

  if (!mediaItem) {
    return undefined;
  }

  return { ...item, episodeNumber: mediaItem.episodeNumber, seasonNumber: mediaItem.seasonNumber };
};

type Data = {
  seriesPlaylist: Playlist;
  item: PlaylistItem | undefined;
  seriesId: string | null;
  nextItemId: string | undefined;
};

export const useSeriesData = (
  entityId: string,
  episodeId: string,
): {
  data: Data;
  isItemError: boolean;
  isPlaylistError: boolean;
  isLoading: boolean;
} => {
  const { data: seriesData, isLoading: isSeriesLoading, error: seriesError } = useSeries(entityId);
  // We enable it only after new series api unsuccessful load
  const { data: playlistData, isLoading: isPlaylistLoading, error: playlistError } = usePlaylist(entityId, {}, !isSeriesLoading && Boolean(seriesError), false);

  const data = getData(seriesData, playlistData, seriesError);

  const { data: rawItem, isLoading: isEpisodeLoading, isError: isItemError } = useMedia(episodeId);

  const item = seriesData?.playlist ? enrichMediaItem(data.playlist, rawItem) : rawItem;
  const nextItemId = getNextItemId(item, seriesData?.series, seriesData?.playlist);

  return {
    // In case we can't find a series item in series api => we do it via old playlist api
    data: {
      seriesPlaylist: data,
      item,
      seriesId: seriesData?.series ? seriesData.series.series_id : getSeriesIdFromEpisode(item),
      nextItemId,
    },
    isPlaylistError: Boolean(seriesError && playlistError),
    isItemError: isItemError,
    isLoading: isSeriesLoading || isPlaylistLoading || isEpisodeLoading,
  };
};
