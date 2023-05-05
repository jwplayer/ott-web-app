import { useQuery, UseQueryResult } from 'react-query';

import { getEpisodes, getMediaById, getSeries } from '#src/services/api.service';
import type { Series } from '#types/series';
import type { Playlist } from '#types/playlist';
import type { ApiError } from '#src/utils/api';

// Series and media items have the same id when creating via dashboard using new flow
export default (seriesId: string | undefined): UseQueryResult<{ series: Series; playlist: Playlist }, ApiError> => {
  return useQuery(
    ['series', seriesId],
    async () => {
      const [series, media, episodesData] = await Promise.all([getSeries(seriesId || ''), getMediaById(seriesId || ''), getEpisodes(seriesId || '', 0)]);

      return {
        series,
        playlist: {
          playlist: episodesData.episodes,
          title: media?.title,
          description: media?.description,
          feedid: media?.series_id,
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
