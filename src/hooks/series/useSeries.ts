import { useQuery, UseQueryResult } from 'react-query';

import type { Series } from '#types/series';
import type { ApiError } from '#src/utils/api';
import { CACHE_TIME, STALE_TIME } from '#src/config';
import ApiService from '#src/services/api.service';
import { getModule } from '#src/modules/container';

export const useSeries = (
  seriesId: string | undefined,
): {
  data: Series | undefined;
  error: ApiError | null;
  isLoading: boolean;
} => {
  const apiService = getModule(ApiService);

  // Try to get new series flow data
  const { data, isLoading, error }: UseQueryResult<Series, ApiError> = useQuery(
    ['series', seriesId],
    async () => {
      const series = await apiService.getSeries(seriesId || '');

      return series;
    },
    {
      enabled: !!seriesId,
      staleTime: STALE_TIME,
      cacheTime: CACHE_TIME,
      // Don't retry when we got a not found error from either series or media item request (prevent unneeded requests)
      // Both errors mean that old series flow should be used
      retry: (failureCount, error: ApiError) => error.code !== 404 && failureCount < 2,
    },
  );

  return { data, isLoading, error };
};
