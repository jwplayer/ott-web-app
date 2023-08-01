import { useQuery } from 'react-query';

import type { Series } from '#types/series';
import { SERIES_CACHE_TIME } from '#src/config';
import { getEpisodes } from '#src/services/api.service';

export const useNextEpisode = ({ series, episodeId }: { series: Series | undefined; episodeId: string | undefined }) => {
  const { isLoading, data } = useQuery(
    ['next-episode', series?.series_id, episodeId],
    async () => {
      const item = await getEpisodes({ seriesId: series?.series_id, pageLimit: 1, afterId: episodeId });

      return item?.episodes?.[0];
    },
    { staleTime: SERIES_CACHE_TIME, cacheTime: SERIES_CACHE_TIME, enabled: !!(series?.series_id && episodeId) },
  );

  return {
    isLoading,
    data,
  };
};
