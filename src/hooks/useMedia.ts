import { UseBaseQueryResult, useQuery } from 'react-query';
import type { PlaylistItem } from 'types/playlist';

import { getMediaById } from '../services/api.service';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  return useQuery(['media', mediaId], () => getMediaById(mediaId), {
    enabled: !!mediaId && enabled,
  });
}
