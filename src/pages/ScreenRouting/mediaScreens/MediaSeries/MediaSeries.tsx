import type { ScreenComponent } from '#types/screens';
import { getSeriesId } from '#src/utils/media';
import SeriesRedirect from '#src/containers/SeriesRedirect/SeriesRedirect';
import type { PlaylistItem } from '#types/playlist';
import Loading from '#src/pages/Loading/Loading';

/**
 * This media screen is used to redirect a series linking media item to an episode page.
 */
const MediaSeries: ScreenComponent<PlaylistItem> = ({ data, isLoading }) => {
  const seriesId = getSeriesId(data) || '';

  // prevent rendering the SeriesRedirect multiple times when we are loading data
  if (isLoading) {
    return <Loading />;
  }

  return <SeriesRedirect seriesId={seriesId} />;
};

export default MediaSeries;
