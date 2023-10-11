import { useQuery } from 'react-query';

import { useConfigStore } from '#src/stores/ConfigStore';
import type { GetPlaylistParams } from '#types/playlist';
import type { GetMediaParams } from '#types/media';
import type AccountController from '#src/stores/AccountController';
import { useController } from '#src/ioc/container';
import { CONTROLLERS } from '#src/ioc/types';
import type EntitlementController from '#src/stores/EntitlementController';

const useContentProtection = <T>(
  type: EntitlementType,
  id: string | undefined,
  callback: (token?: string, drmPolicyId?: string) => Promise<T | undefined>,
  params: GetPlaylistParams | GetMediaParams = {},
  enabled: boolean = true,
  placeholderData?: T,
) => {
  const entitlementController = useController<EntitlementController>(CONTROLLERS.Entitlement);

  const { configId, signingConfig, contentProtection, jwp, urlSigning } = useConfigStore(({ config }) => ({
    configId: config.id,
    signingConfig: config.contentSigningService,
    contentProtection: config.contentProtection,
    jwp: config.integrations.jwp,
    urlSigning: config?.custom?.urlSigning,
  }));
  const host = signingConfig?.host;
  const drmPolicyId = contentProtection?.drm?.defaultPolicyId ?? signingConfig?.drmPolicyId;
  const signingEnabled = !!urlSigning || !!host || (!!drmPolicyId && !host);

  const { data: token, isLoading } = useQuery(
    ['token', type, id, params],
    async () => {
      // if provider is not JWP
      if (!!id && !!host) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const accountController = useController<AccountController>(CONTROLLERS.Account);
        const authData = await accountController.getAuthData();
        const { host, drmPolicyId } = signingConfig;
        return entitlementController.getMediaToken(host, id, authData?.jwt, params, drmPolicyId);
      }
      // if provider is JWP
      if (jwp && configId && !!id && signingEnabled) {
        return entitlementController.getJWPMediaToken(configId, id);
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
