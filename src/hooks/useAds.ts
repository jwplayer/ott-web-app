import { useQuery } from 'react-query';

import { getMediaAds, getAdSchedule } from '#src/services/api.service';
import { useConfigStore } from '#src/stores/ConfigStore';

const CACHE_TIME = 60 * 1000 * 20;

const useAdSchedule = ({ adScheduleId, enabled }: { adScheduleId: string | null | undefined; enabled: boolean }) => {
  const { isLoading, data } = useQuery(
    ['ad-schedule', adScheduleId],
    async () => {
      const adSchedule = await getAdSchedule(adScheduleId);

      return adSchedule;
    },
    { enabled: enabled && !!adScheduleId, cacheTime: CACHE_TIME, staleTime: CACHE_TIME },
  );

  return {
    isLoading,
    data,
  };
};

const useMediaAds = ({ jsonUrl, mediaId, enabled }: { jsonUrl: string | null | undefined; mediaId: string; enabled: boolean }) => {
  const { isLoading, data } = useQuery(
    ['media-ads', mediaId],
    async () => {
      // Waiting for `prd` deploy to remove `replace`
      const mediaAds = await getMediaAds(jsonUrl?.replace('advertising/site', 'sites') as string, mediaId);

      return mediaAds;
    },
    { enabled: enabled && !!mediaId, cacheTime: CACHE_TIME, staleTime: CACHE_TIME },
  );

  return {
    isLoading,
    data,
  };
};

export const useAds = ({ mediaId }: { mediaId: string }) => {
  const { adSchedule: adScheduleId, adScheduleUrls } = useConfigStore((s) => s.config);

  // adScheduleUrls.json prop exists when ad-config is attached to the App Config
  const usePerMediaAds = !!adScheduleUrls?.json;

  const { data: mediaAds, isLoading: isMediaAdsLoading } = useMediaAds({ jsonUrl: adScheduleUrls?.json, mediaId, enabled: usePerMediaAds });
  const { data: adSchedule, isLoading: isAdScheduleLoading } = useAdSchedule({ adScheduleId, enabled: !usePerMediaAds });

  return {
    isLoading: usePerMediaAds ? isMediaAdsLoading : isAdScheduleLoading,
    data: usePerMediaAds ? mediaAds : adSchedule,
  };
};
