import { UseBaseQueryResult, useQuery } from 'react-query';

import { getMediaById } from '../services/api.service';
import { transformMediaItem } from '../utils/media';

import type { PlaylistItem } from '#types/playlist';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  return useQuery(
    ['media', mediaId],
    async () => {
      const media = await getMediaById(mediaId);

      // Parse TVOD media offers, if present
      return !!media && transformMediaItem(media);
    },
    {
      enabled: !!mediaId && enabled,
      keepPreviousData: true,
    },
  );
}
