import { UseBaseQueryResult, useQuery } from 'react-query';

import { getMediaById } from '#src/services/api.service';
import type { PlaylistItem } from '#types/playlist';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  return useQuery(['media', mediaId], () => getMediaById(mediaId), {
    enabled: !!mediaId && enabled,
    keepPreviousData: true,
  });
}
