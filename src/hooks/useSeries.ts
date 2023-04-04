import { useQuery, UseQueryResult } from 'react-query';

import { getMediaById, getSeries, getEpisodes } from '#src/services/api.service';
import { enrichMediaItems } from '#src/utils/series';
import type { Series } from '#types/series';
import type { Playlist } from '#types/playlist';
import type { ApiError } from '#src/utils/api';

// Series and media items have the same id when creating via dashboard using new flow
export default (seriesId: string | undefined): UseQueryResult<{ series: Series; playlist: Playlist }, ApiError> => {
  return useQuery(
    ['series', seriesId],
    async () => {
      const series = await getSeries(seriesId || '');
      const media = await getMediaById(seriesId || '');
      const mediaItems = await getEpisodes(seriesId);

      return {
        series,
        playlist: {
          title: media?.title,
          description: media?.description,
          feedid: media?.series_id,
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
