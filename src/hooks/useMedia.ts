import { UseBaseQueryResult, useQuery } from 'react-query';

import type { PlaylistItem } from '#types/playlist';
import { isScheduledOrLiveMedia } from '#src/utils/liveEvent';
import ApiController from '#src/stores/ApiController';
import { getModule } from '#src/container';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  const apiController = getModule(ApiController);

  return useQuery(['media', mediaId], () => apiController.getMediaById(mediaId), {
    enabled: !!mediaId && enabled,
    refetchInterval: (data, _) => {
      if (!data) return false;

      const autoRefetch = isScheduledOrLiveMedia(data);

      return autoRefetch ? 1000 * 30 : false;
    },
    staleTime: 60 * 1000 * 10, // 10 min
  });
}
