import { useQuery } from 'react-query';

import { getJWPMediaToken, getMediaToken } from '#src/services/entitlement.service';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { GetPlaylistParams } from '#types/playlist';
import type { GetMediaParams } from '#types/media';
import { useAccountStore } from '#src/stores/AccountStore';

const useContentProtection = <T>(
  type: EntitlementType,
  id: string | undefined,
  callback: (token?: string, drmPolicyId?: string) => Promise<T | undefined>,
  params: GetPlaylistParams | GetMediaParams = {},
  enabled: boolean = true,
  placeholderData?: T,
) => {
  const jwt = useAccountStore((store) => store.auth?.jwt);
  const { configId, signingConfig, contentProtection, jwp, urlSigning } = useConfigStore(({ config }) => ({
    configId: config.id,
    signingConfig: config.contentSigningService,
    contentProtection: config.contentProtection,
    jwp: config.integrations.jwp,
    urlSigning: config?.custom?.urlSigning,
  }));
  const host = signingConfig?.host;
  const drmPolicyId = contentProtection?.drm?.defaultPolicyId ?? signingConfig?.drmPolicyId;
  const drmEnabled = !!drmPolicyId;
  const signingEnabled = !!host || !!urlSigning;

  const { data: token, isLoading } = useQuery(
    ['token', type, id, params],
    () => {
      if (jwp && configId && !!id && signingEnabled) {
        return getJWPMediaToken(configId, id);
      }

      if (!!id && !!host && drmEnabled && signingEnabled) {
        const { host, drmPolicyId } = signingConfig;
        return getMediaToken(host, id, jwt, params, drmPolicyId);
      }
    },
    { enabled: signingEnabled && enabled && !!id, keepPreviousData: false, staleTime: 15 * 60 * 1000 },
  );

  const queryResult = useQuery<T | undefined>([type, id, params, token], async () => callback(token, drmPolicyId), {
    enabled: !!id && enabled && (!signingEnabled || !!token),
    placeholderData: id ? placeholderData : undefined,
    retry: 2,
    retryDelay: 1000,
    keepPreviousData: false,
  });

  return {
    ...queryResult,
    isLoading: isLoading || queryResult.isLoading,
  };
};

export default useContentProtection;
