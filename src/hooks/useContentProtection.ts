import { useQuery } from 'react-query';

import { getPublicToken } from '#src/services/entitlement.service';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { GetPlaylistParams } from '#types/playlist';
import type { GetMediaParams } from '#types/media';

const useContentProtection = <T>(
  type: EntitlementType,
  id: string | undefined,
  callback: (token?: string, drmPolicyId?: string) => Promise<T | undefined>,
  params: GetPlaylistParams | GetMediaParams = {},
  enabled: boolean = true,
  placeholderData?: T,
) => {
  const signingConfig = useConfigStore((store) => store.config.contentSigningService);
  const host = signingConfig?.host;
  const drmPolicyId = signingConfig?.drmPolicyId;
  const drmEnabled = !!drmPolicyId;
  const signingEnabled = !!host && drmEnabled;

  const { data: token, isLoading } = useQuery(
    ['token', type, id, params],
    () => {
      // we only want to sign public media/playlist URLs when DRM is enabled
      if (!!id && !!host && drmEnabled) {
        const { host, drmPolicyId } = signingConfig;

        return getPublicToken(host, type, id, undefined, params, drmPolicyId);
      }
    },
    { enabled: signingEnabled && enabled && !!id, keepPreviousData: false, staleTime: 15 * 60 * 1000 },
  );

  const queryResult = useQuery<T | undefined>([type, id, params, token], async () => callback(token, drmPolicyId), {
    enabled: !!id && enabled && (!signingEnabled || !!token),
    placeholderData: id ? placeholderData : undefined,
    retry: type === 'media' ? 2 : false,
    retryDelay: 1000,
    keepPreviousData: true,
  });

  return {
    ...queryResult,
    isLoading: isLoading || queryResult.isLoading,
  };
};

export default useContentProtection;
