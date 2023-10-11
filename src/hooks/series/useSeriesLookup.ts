import { useQuery } from 'react-query';

import { SERIES_CACHE_TIME } from '#src/config';
import type ApiController from '#src/stores/ApiController';
import { useController } from '#src/ioc/container';
import { CONTROLLERS } from '#src/ioc/types';

export const useSeriesLookup = (mediaId: string | undefined) => {
  const apiController = useController<ApiController>(CONTROLLERS.Api);

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
