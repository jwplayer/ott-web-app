import type { ScreenComponent } from '#types/screens';
import { getSeriesPlaylistIdFromCustomParams } from '#src/utils/media';
import SeriesRedirect from '#src/containers/SeriesRedirect/SeriesRedirect';
import type { PlaylistItem } from '#types/playlist';
import Loading from '#src/pages/Loading/Loading';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';

/**
 * This media screen is used to redirect a series linking media item to an episode page.
 */
const MediaSeries: ScreenComponent<PlaylistItem> = ({ data: media, isLoading }) => {
  const seriesId = getSeriesPlaylistIdFromCustomParams(media) || '';

  // Retrieve watch history for new flow and find an episode of the selected series (if present)
  const watchHistoryDictionary = useWatchHistoryStore((state) => state.watchHistory);
  const episodeInProgress = watchHistoryDictionary.find((episode) => episode?.seriesId === media.mediaid);

  // Prevent rendering the SeriesRedirect multiple times when we are loading data
  if (isLoading) {
    return <Loading />;
  }

  return <SeriesRedirect seriesId={seriesId} mediaId={media.mediaid} episodeId={episodeInProgress?.mediaid} />;
};

export default MediaSeries;
