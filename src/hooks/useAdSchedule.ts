import { useQuery } from 'react-query';

import { getAdSchedule } from '#src/services/api.service';

const CACHE_TIME = 60 * 1000 * 60 * 8;

export const useAdSchedule = (adScheduleId: string | null | undefined) => {
  const { isLoading, data } = useQuery(
    ['ad-schedule'],
    async () => {
      const adSchedule = await getAdSchedule(adScheduleId);

      return adSchedule;
    },
    { enabled: Boolean(adScheduleId), cacheTime: CACHE_TIME, staleTime: CACHE_TIME },
  );

  return {
    isLoading,
    data,
  };
};
