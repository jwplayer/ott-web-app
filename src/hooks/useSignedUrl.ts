import { useQuery } from 'react-query';

import { getPublicToken } from '#src/services/entitlement.service';
import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { PlaylistParams } from '#types/playlist';

const useSignedUrl = (type: EntitlementType, id: string, params: PlaylistParams = {}, enabled: boolean = true) => {
  const jwt = useAccountStore((store) => store.auth?.jwt);
  const signingConfig = useConfigStore((store) => store.config.contentSigningService);
  const host = signingConfig?.host;
  const drmPolicyId = signingConfig?.drmPolicyId;
  const drmEnabled = !!drmPolicyId && !!signingConfig?.drmEnabled;
  const signingEnabled = !!host && drmEnabled && !!drmPolicyId;

  const { data: token, isLoading } = useQuery(
    ['token', type, id, params, jwt],
    () => {
      if (!!signingConfig?.host && signingConfig?.drmEnabled && !!signingConfig?.drmPolicyId) {
        const { host, drmPolicyId } = signingConfig;

        return getPublicToken(host, type, id, jwt, params, drmPolicyId);
      }
    },
    { enabled: signingEnabled && enabled, keepPreviousData: false, staleTime: 15 * 60 * 1000 },
  );

  return { token, signingEnabled, drmEnabled, drmPolicyId, isLoading };
};

export default useSignedUrl;
