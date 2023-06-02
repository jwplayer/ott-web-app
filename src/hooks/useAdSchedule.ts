import { useQuery } from 'react-query';

import { getAdSchedule } from '#src/services/api.service';

const ids = ['kU5VLJTk', 'Gh4EcEhT'];

export const useAdSchedule = (mediaId: string | undefined) => {
  const { isLoading, data } = useQuery(
    ['per-media-schedule', mediaId],
    async () => {
      const adSchedule = await getAdSchedule(ids[Math.round(Math.random())]);

      return adSchedule;
    },
    { enabled: Boolean(mediaId) },
  );

  return {
    isLoading,
    data,
  };
};
