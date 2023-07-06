import { useQuery } from 'react-query';

import type { Series } from '#types/series';
import { SERIES_CACHE_TIME } from '#src/config';
import { getEpisodes } from '#src/services/api.service';

export const useNextEpisode = ({ series, episodeId }: { series: Series | undefined; episodeId: string | null }) => {
  const { isLoading, data } = useQuery(
    ['next-episode', series?.series_id, episodeId],
    async () => {
      const item = await getEpisodes(series?.series_id, null, 1, episodeId);

      return item?.episodes?.[0];
    },
    { staleTime: SERIES_CACHE_TIME, cacheTime: SERIES_CACHE_TIME, enabled: !!(series?.series_id && episodeId) },
  );

  return {
    isLoading,
    data,
  };
};
