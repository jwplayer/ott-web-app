import { useQuery } from 'react-query';

import type { Series } from '#types/series';
import { SERIES_CACHE_TIME } from '#src/config';
import type ApiController from '#src/stores/ApiController';
import { useController } from '#src/ioc/container';
import { CONTROLLERS } from '#src/ioc/types';

export const useNextEpisode = ({ series, episodeId }: { series: Series | undefined; episodeId: string | undefined }) => {
  const apiController = useController<ApiController>(CONTROLLERS.Api);

  const { isLoading, data } = useQuery(
    ['next-episode', series?.series_id, episodeId],
    async () => {
      const item = await apiController.getEpisodes({ seriesId: series?.series_id, pageLimit: 1, afterId: episodeId });

      return item?.episodes?.[0];
    },
    { staleTime: SERIES_CACHE_TIME, cacheTime: SERIES_CACHE_TIME, enabled: !!(series?.series_id && episodeId) },
  );

  return {
    isLoading,
    data,
  };
};
