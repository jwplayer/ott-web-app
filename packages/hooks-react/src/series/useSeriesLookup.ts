import { useQuery } from 'react-query';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { CACHE_TIME, STALE_TIME } from '@jwp/ott-common/src/constants';

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
