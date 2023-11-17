import { useQuery } from 'react-query';
import type { Series } from '@jwplayer/ott-common/types/series';
import ApiService from '@jwplayer/ott-common/src/services/api.service';
import { getModule } from '@jwplayer/ott-common/src/modules/container';
import { CACHE_TIME, STALE_TIME } from '@jwplayer/ott-common/src/constants';

export const useNextEpisode = ({ series, episodeId }: { series: Series | undefined; episodeId: string | undefined }) => {
  const apiService = getModule(ApiService);

  const { isLoading, data } = useQuery(
    ['next-episode', series?.series_id, episodeId],
    async () => {
      const item = await apiService.getEpisodes({ seriesId: series?.series_id, pageLimit: 1, afterId: episodeId });

      return item?.episodes?.[0];
    },
    { staleTime: STALE_TIME, cacheTime: CACHE_TIME, enabled: !!(series?.series_id && episodeId) },
  );

  return {
    isLoading,
    data,
  };
};
