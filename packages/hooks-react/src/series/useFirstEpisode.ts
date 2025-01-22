import { useQuery } from 'react-query';
import type { Series } from '@jwp/ott-common/types/series';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { CACHE_TIME, STALE_TIME } from '@jwp/ott-common/src/constants';
import { useTranslation } from 'react-i18next';

export const useFirstEpisode = ({ series }: { series: Series | undefined }) => {
  const apiService = getModule(ApiService);
  const { i18n } = useTranslation();

  const { isLoading, data } = useQuery(
    ['first-episode', series?.series_id],
    async () => {
      const item = await apiService.getEpisodes({ seriesId: series?.series_id, pageLimit: 1, language: i18n.language });

      return item?.episodes?.[0];
    },
    { staleTime: STALE_TIME, cacheTime: CACHE_TIME, enabled: !!series?.series_id },
  );

  return {
    isLoading,
    data,
  };
};
