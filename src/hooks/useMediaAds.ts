import { useQuery } from 'react-query';

import { getMediaAdSchedule } from '#src/services/api.service';
import { useAdSchedule } from '#src/hooks/useAdSchedule';
import type { AdTagUrls } from '#types/ad-schedule';

// 204 code
export const useMediaAds = (adScheduleId: string | null | undefined, mediaId: string, urls: AdTagUrls) => {
  const { data: adSchedule, isLoading: isAdScheduleLoading } = useAdSchedule(adScheduleId);

  const { isLoading: isPerMediaAdSchedule, data: perMediaAds } = useQuery(
    ['per-media-ad-schedule', mediaId],
    async () => {
      const adSchedule = await getMediaAdSchedule(mediaId, urls, adScheduleId);

      return adSchedule;
    },
    { enabled: Boolean(mediaId) },
  );

  return {
    isLoading: isAdScheduleLoading || isPerMediaAdSchedule,
    data: perMediaAds || adSchedule,
  };
};
