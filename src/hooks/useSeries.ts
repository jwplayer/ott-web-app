import { useQuery, UseQueryResult } from 'react-query';

import { getMediaByIds, getSeries } from '#src/services/api.service';
import { enrichMediaItems, getSeriesEpisodes } from '#src/utils/series';
import type { Series } from '#types/series';
import type { Playlist } from '#types/playlist';
import type { ApiError } from '#src/utils/api';

export default (seriesId?: string): UseQueryResult<{ series: Series; playlist: Playlist }, ApiError> => {
  return useQuery(
    ['series', seriesId],
    async () => {
      const series = await getSeries(seriesId || '');
      const mediaIds = series ? getSeriesEpisodes(series).map((episode) => episode.media_id) : [];
      const mediaItems = await getMediaByIds(mediaIds);

      return {
        series,
        playlist: {
          title: series?.title,
          description: series?.description,
          feedid: series?.series_id,
          playlist: enrichMediaItems(series, mediaItems),
        },
      };
    },
    {
      enabled: !!seriesId,
      // 8 hours
      staleTime: 60 * 1000 * 60 * 8,
      // don't retry when we got a not found (prevent unneeded requests)
      retry: (failureCount, error) => error.code !== 404 && failureCount < 2,
    },
  );
};
