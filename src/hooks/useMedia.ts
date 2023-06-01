import { UseBaseQueryResult, useQuery } from 'react-query';

import { getMediaById } from '#src/services/api.service';
import type { PlaylistItem } from '#types/playlist';
import { isScheduledOrLiveMedia } from '#src/utils/liveEvent';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  return useQuery(['media', mediaId], () => getMediaById(mediaId), {
    enabled: !!mediaId && enabled,
    refetchInterval: (data, _) => {
      if (!data) return false;

      const autoRefetch = isScheduledOrLiveMedia(data);

      return autoRefetch ? 1000 * 30 : false;
    },
    staleTime: 60 * 1000 * 10, // 10 min
  });
}
