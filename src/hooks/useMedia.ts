import { UseBaseQueryResult, useQuery } from 'react-query';

import { getDRMMediaById, getMediaById } from '../services/api.service';

import type { PlaylistItem } from '#types/playlist';
import { getPublicToken } from '#src/services/entitlement.service';
import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';

export type UseMediaResult<TData = PlaylistItem, TError = unknown> = UseBaseQueryResult<TData, TError>;

export default function useMedia(mediaId: string, enabled: boolean = true): UseMediaResult {
  const jwt = useAccountStore((store) => store.auth?.jwt);
  const signingConfig = useConfigStore((store) => store.config.contentSigningService);

  return useQuery(
    ['media', mediaId],
    async () => {
      const drmEnabled = !!signingConfig?.host && !!signingConfig?.drmEnabled && !!signingConfig?.drmPolicyId;

      if (drmEnabled && signingConfig?.drmEnabled && signingConfig?.drmPolicyId) {
        const { host, drmPolicyId } = signingConfig;
        const token = await getPublicToken(host, 'media', mediaId, drmPolicyId, {}, jwt);

        return getDRMMediaById(mediaId, signingConfig.drmPolicyId, token);
      }

      return getMediaById(mediaId);
    },
    {
      enabled: !!mediaId && enabled,
      keepPreviousData: true,
    },
  );
}
