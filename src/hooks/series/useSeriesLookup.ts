import { useQuery } from 'react-query';

import { STALE_TIME, CACHE_TIME } from '#src/config';
import ApiController from '#src/stores/ApiController';
import { getModule } from '#src/container';

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
    { staleTime: STALE_TIME, cacheTime: CACHE_TIME, enabled: !!mediaId },
  );

  return {
    isLoading,
    data,
  };
};
