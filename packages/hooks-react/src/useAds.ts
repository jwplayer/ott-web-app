import { useQuery } from 'react-query';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import ApiService from '@jwp/ott-common/src/services/ApiService';
import { getModule } from '@jwp/ott-common/src/modules/container';
import { createURL } from '@jwp/ott-common/src/utils/urlFormatting';
import type { AdConfig } from '@jwp/ott-common/types/ad-schedule';

const CACHE_TIME = 60 * 1000 * 20;

/**
 * @deprecated Use ad-config instead.
 */
const useLegacyStandaloneAds = ({ adScheduleId, enabled }: { adScheduleId: string | null | undefined; enabled: boolean }) => {
  const apiService = getModule(ApiService);

  const { isLoading, data } = useQuery(['ad-schedule', adScheduleId], async () => apiService.getAdSchedule(adScheduleId), {
    enabled: enabled && !!adScheduleId,
    cacheTime: CACHE_TIME,
    staleTime: CACHE_TIME,
  });

  return {
    isLoading,
    data,
  };
};

export const useAds = ({ mediaId }: { mediaId: string }) => {
  const { adSchedule: adScheduleId, adConfig: adConfigId, adScheduleUrls, adDeliveryMethod } = useConfigStore((s) => s.config);

  // We use client side ads only when delivery method is not pointing at server ads
  // adConfig and adScheduled can't be enabled at the same time
  const useAdConfigFlow = !!adConfigId && adDeliveryMethod !== 'ssai';

  const { data: adSchedule, isLoading: isAdScheduleLoading } = useLegacyStandaloneAds({ adScheduleId, enabled: !!adScheduleId });
  const adConfig = useAdConfigFlow
    ? ({
        client: 'vast',
        schedule: createURL(adScheduleUrls?.xml || '', {
          media_id: mediaId,
        }),
      } as AdConfig)
    : undefined;

  return {
    isLoading: useAdConfigFlow ? false : isAdScheduleLoading,
    data: useAdConfigFlow ? adConfig : adSchedule,
  };
};
