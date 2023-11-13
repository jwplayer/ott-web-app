import { useQuery } from 'react-query';

import { STALE_TIME, CACHE_TIME } from '#src/config';
import ApiService from '#src/services/api.service';
import { getModule } from '#src/modules/container';

export const useSeriesLookup = (mediaId: string | undefined) => {
  const apiService = getModule(ApiService);

  const { isLoading, data } = useQuery(
    ['seriesLookup', mediaId],
    async () => {
      if (!mediaId) {
        return;
      }

      // get all series for the given media id
      const data = await apiService.getSeriesByMediaIds([mediaId]);
      // get first series for the requested episode
      const firstSeries = data?.[mediaId]?.[0];

      return firstSeries;
    },
    { staleTime: STALE_TIME, cacheTime: CACHE_TIME, enabled: !!mediaId },
  );

  return {
    isLoading,
    data,
  };
};
