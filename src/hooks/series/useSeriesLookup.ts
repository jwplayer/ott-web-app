import { useQuery } from 'react-query';

import { SERIES_CACHE_TIME } from '#src/config';
import ApiController from '#src/stores/ApiController';
import { getModule } from '#src/modules/container';

export const useSeriesLookup = (mediaId: string | undefined) => {
  const apiController = getModule(ApiController);

  const { isLoading, data } = useQuery(
    ['seriesLookup', mediaId],
    async () => {
      if (!mediaId) {
        return;
      }

      // get all series for the given media id
      const data = await apiController.getSeriesByMediaIds([mediaId]);
      // get first series for the requested episode
      const firstSeries = data?.[mediaId]?.[0];

      return firstSeries;
    },
    // 8 hours
    { staleTime: SERIES_CACHE_TIME, cacheTime: SERIES_CACHE_TIME, enabled: !!mediaId },
  );

  return {
    isLoading,
    data,
  };
};
