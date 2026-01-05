import { useQuery, useQueryClient } from 'react-query';
import type { Config } from '@jwp/ott-common/types/config';
import type { Settings } from '@jwp/ott-common/types/settings';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AppController from '@jwp/ott-common/src/controllers/AppController';
import type { AppError } from '@jwp/ott-common/src/utils/error';
import { CACHE_TIME, STALE_TIME } from '@jwp/ott-common/src/constants';
import { logDebug } from '@jwp/ott-common/src/logger';
import { useTranslation } from 'react-i18next';

type Resources = {
  config: Config;
  configSource: string | undefined;
  settings: Settings;
};

export type OnReadyCallback = (config: Config | undefined) => void;

export const useBootstrapApp = (url: string, onReady: OnReadyCallback) => {
  const applicationController = getModule(AppController);
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();

  const refreshEntitlements = () => queryClient.invalidateQueries({ queryKey: ['entitlements'] });

  const { data, isLoading, error, isSuccess, refetch } = useQuery<Resources, Error | AppError>(
    'config-init',
    () => applicationController.initializeApp(url, i18n.language, refreshEntitlements),
    {
      refetchInterval: false,
      retry: 1,
      onSettled: (query) => {
        logDebug('Bootstrap', 'Initialized application', { ...query });
        onReady(query?.config);
      },
      cacheTime: CACHE_TIME,
      staleTime: STALE_TIME,
    },
  );

  return {
    data,
    isLoading,
    error,
    isSuccess,
    refetch,
  };
};

export type BootstrapData = ReturnType<typeof useBootstrapApp>;
