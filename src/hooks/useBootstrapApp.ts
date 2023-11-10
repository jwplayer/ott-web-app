import { useQuery } from 'react-query';

import { CACHE_TIME, STALE_TIME } from '#src/config';
import { getModule } from '#src/container';
import AppController from '#src/stores/AppController';
import { useTrackConfigKeyChange } from '#src/hooks/useTrackConfigKeyChange';
import type { Config } from '#types/Config';
import type { Settings } from '#src/stores/ConfigStore';

const applicationController = getModule(AppController);

type Resources = {
  config: Config;
  configSource: string | undefined;
  settings: Settings;
};

export const useBootstrapApp = (onReady: () => void) => {
  const { data, isLoading, error, isError, isSuccess } = useQuery<Resources, Error>('config-init', applicationController.initializeApp, {
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
    isError,
    isSuccess,
  };
};
