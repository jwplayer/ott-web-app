import { useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { Settings } from '#types/settings';
import { CONFIG_QUERY_KEY } from '#src/config';

export function useTrackConfigKeyChange(settings: Settings | undefined, configSource: string | undefined) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Update the query string to maintain the right params
  useLayoutEffect(() => {
    if (!settings) {
      return;
    }

    // If there is no valid config source or the config source equals the default, remove the ?app-config= param
    if (searchParams.has(CONFIG_QUERY_KEY) && (!configSource || configSource === settings?.defaultConfigSource)) {
      setSearchParams(
        (s) => {
          s.delete(CONFIG_QUERY_KEY);

          return s;
        },
        { replace: true },
      );
    }

    // If the config source is not the default and the query string isn't set right, set the ?app-config= param
    if (configSource && configSource !== settings?.defaultConfigSource && searchParams.get(CONFIG_QUERY_KEY) !== configSource) {
      setSearchParams(
        (s) => {
          s.set(CONFIG_QUERY_KEY, configSource);
          return s;
        },
        { replace: true },
      );
    }
  }, [configSource, searchParams, setSearchParams, settings]);

  return configSource;
}
