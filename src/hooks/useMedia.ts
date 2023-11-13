import { UseBaseQueryResult, useQuery } from 'react-query';

import type { PlaylistItem } from '#types/playlist';
import { isScheduledOrLiveMedia } from '#src/utils/liveEvent';
import ApiService from '#src/services/api.service';
import { getModule } from '#src/modules/container';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  const apiService = getModule(ApiService);

  return useQuery(['media', mediaId], () => apiService.getMediaById(mediaId), {
    enabled: !!mediaId && enabled,
    refetchInterval: (data, _) => {
      if (!data) return false;

      const autoRefetch = isScheduledOrLiveMedia(data);

      return autoRefetch ? 1000 * 30 : false;
    },
    staleTime: 60 * 1000 * 10, // 10 min
  });
}
