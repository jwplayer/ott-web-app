import { useQuery } from 'react-query';
import type { Config } from '@jwp/ott-common/types/config';
import type { Settings } from '@jwp/ott-common/types/settings';
import { getModule } from '@jwp/ott-common/src/modules/container';
import AppController from '@jwp/ott-common/src/stores/AppController';
import type { AppError } from '@jwp/ott-common/src/utils/error';
import { CACHE_TIME, STALE_TIME } from '@jwp/ott-common/src/constants';

import { useTrackConfigKeyChange } from './useTrackConfigKeyChange';

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
