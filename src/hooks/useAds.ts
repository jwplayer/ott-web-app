import { useQuery } from 'react-query';

import { getMediaAds, getAdSchedule } from '#src/services/api.service';
import type { AdScheduleUrls } from '#types/ad-schedule';

const CACHE_TIME = 60 * 1000 * 20;

const useAdSchedule = (adScheduleId: string | null | undefined, enabled: boolean) => {
  const { isLoading, data } = useQuery(
    ['ad-schedule', adScheduleId],
    async () => {
      const adSchedule = await getAdSchedule(adScheduleId);

      return adSchedule;
    },
    { enabled, cacheTime: CACHE_TIME, staleTime: CACHE_TIME },
  );

  return {
    isLoading,
    data,
  };
};

const useMediaAds = (jsonUrl: string | null | undefined, mediaId: string, enabled: boolean) => {
  const { isLoading, data } = useQuery(
    ['media-ads', mediaId],
    async () => {
      // Waiting for `prd` deploy to remove `replace`
      const mediaAds = await getMediaAds(jsonUrl?.replace('advertising/site', 'sites') as string, mediaId);

      return mediaAds;
    },
    { enabled, cacheTime: CACHE_TIME, staleTime: CACHE_TIME },
  );

  return {
    isLoading,
    data,
  };
};

export const useAds = (adScheduleId: string | null | undefined, urls: AdScheduleUrls | undefined, mediaId: string) => {
  const hasAdConfig = !!urls?.json;

  // Fetch ad-schedule only when ad-config is not set (`adScheduleUrls.json` prop is not set) + adScheduleId is present
  const { data: adSchedule, isLoading: isAdScheduleLoading } = useAdSchedule(adScheduleId, !!(adScheduleId && hasAdConfig));
  // adScheduleUrls.json prop exists when ad-config is attached to the App Config
  const { isLoading: isMediaAdsLoading, data: mediaAds } = useMediaAds(urls?.json, mediaId, hasAdConfig);

  return {
    isLoading: isAdScheduleLoading || isMediaAdsLoading,
    data: mediaAds || adSchedule,
  };
};
