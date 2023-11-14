import { useQuery } from 'react-query';

import { CACHE_TIME, STALE_TIME } from '#src/config';
import AppController from '#src/stores/AppController';
import { useTrackConfigKeyChange } from '#src/hooks/useTrackConfigKeyChange';
import type { Config } from '#types/Config';
import type { Settings } from '#types/settings';
import type { AppError } from '#src/utils/error';
import { getModule } from '#src/modules/container';

const applicationController = getModule(AppController);

type Resources = {
  config: Config;
  configSource: string | undefined;
  settings: Settings;
};

export const useBootstrapApp = (onReady: () => void) => {
  const { data, isLoading, error, isSuccess, refetch } = useQuery<Resources, AppError>('config-init', applicationController.initializeApp, {
    refetchInterval: false,
    retry: 1,
    onSuccess: onReady,
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });

  // Modify query string to add / remove app-config id
  useTrackConfigKeyChange(data?.settings, data?.configSource);

  return {
    data,
    isLoading,
    error,
    isSuccess,
    refetch,
  };
};

export type BootstrapData = ReturnType<typeof useBootstrapApp>;
