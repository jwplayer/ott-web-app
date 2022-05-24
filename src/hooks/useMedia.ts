import { UseBaseQueryResult, useQuery } from 'react-query';

import { getMediaById } from '../services/api.service';
import { filterMediaOffers } from '../utils/entitlements';

import type { PlaylistItem } from '#types/playlist';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  return useQuery(
    ['media', mediaId],
    async () => {
      // Parse TVOD media offers, if present
      const media = await getMediaById(mediaId);
      if (media?.productIds) media.mediaOffers = filterMediaOffers('cleeng', media.productIds);

      return media;
    },
    {
      enabled: !!mediaId && enabled,
      keepPreviousData: true,
    },
  );
}
