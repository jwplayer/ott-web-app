import { useQuery } from 'react-query';

import { getSeriesByMediaIds } from '#src/services/api.service';
import { SERIES_CACHE_TIME } from '#src/config';

export const useSeriesLookup = (mediaId: string | undefined) => {
  const { isLoading, data } = useQuery(
    ['seriesLookup', mediaId],
    async () => {
      if (!mediaId) {
        return;
      }

      // get all series for the given media id
      const data = await getSeriesByMediaIds([mediaId]);
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
