import { useQuery } from 'react-query';

import { CACHE_TIME, STALE_TIME } from '#src/config';
import AppController from '#src/stores/AppController';
import { useTrackConfigKeyChange } from '#src/hooks/useTrackConfigKeyChange';
import type { Config } from '#types/config';
import type { Settings } from '#src/stores/ConfigStore';
import { getModule } from '#src/modules/container';

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
