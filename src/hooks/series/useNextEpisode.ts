import { useQuery } from 'react-query';

import type { Series } from '#types/series';
import { CACHE_TIME, STALE_TIME } from '#src/config';
import ApiService from '#src/services/api.service';
import { getModule } from '#src/modules/container';

export const useNextEpisode = ({ series, episodeId }: { series: Series | undefined; episodeId: string | undefined }) => {
  const apiService = getModule(ApiService);

  const { isLoading, data } = useQuery(
    ['next-episode', series?.series_id, episodeId],
    async () => {
      const item = await apiService.getEpisodes({ seriesId: series?.series_id, pageLimit: 1, afterId: episodeId });

      return item?.episodes?.[0];
    },
    { staleTime: STALE_TIME, cacheTime: CACHE_TIME, enabled: !!(series?.series_id && episodeId) },
  );

  return {
    isLoading,
    data,
  };
};
