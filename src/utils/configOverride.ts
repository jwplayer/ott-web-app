import type { NavigateFunction } from 'react-router/dist/lib/hooks';
import { useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { logDev } from '#src/utils/common';
import type { Settings } from '#src/stores/SettingsStore';

// Use local storage so the override persists until cleared
const storage = window.localStorage;

const configQueryKey = 'app-config';
const configLegacyQueryKey = 'c';

const configFileStorageKey = 'config-file-override';

export function getConfigNavigateCallback(navigate: NavigateFunction) {
  return (configSource: string) => {
    navigate(
      {
        pathname: '/',
        search: new URLSearchParams([[configQueryKey, configSource]]).toString(),
      },
      { replace: true },
    );
  };
}

function getConfigSource(configKey: string | null, settings: Settings | undefined) {
  if (!settings) {
    return '';
  }

  // Skip all the fancy logic below if there aren't any other options besides the default anyhow
  if (!settings.UNSAFE_allowAnyConfigSource && (settings.additionalAllowedConfigSources?.length || 0) <= 0) {
    return settings.defaultConfigSource;
  }

  if (configKey !== null) {
    // If the query param exists but the value is empty, clear the storage and allow fallback to the default config
    if (!configKey) {
      storage.removeItem(configFileStorageKey);
      return settings.defaultConfigSource;
    }

    // If it's valid, store it and return it
    if (isValidConfigSource(configKey, settings)) {
      storage.setItem(configFileStorageKey, configKey);
      return configKey;
    }

    logDev(`Invalid app-config query param: ${configKey}`);
  }
  // Yes this falls through from above to look up the stored value if the query string is invalid and that's OK

  const storedSource = storage.getItem(configFileStorageKey);

  // Make sure the stored value is still valid before returning it
  if (storedSource) {
    if (isValidConfigSource(storedSource, settings)) {
      return storedSource;
    }

    logDev('Invalid stored config: ' + storedSource);
    storage.removeItem(configFileStorageKey);
  }

  return settings.defaultConfigSource;
}

export function useConfigSource(settings?: Settings) {
  const [searchParams, setSearchParams] = useSearchParams();

  const configKey = searchParams.get(configQueryKey) ?? searchParams.get(configLegacyQueryKey);
  const configSource = useMemo(() => getConfigSource(configKey, settings), [configKey, settings]);

  // Update the query string to maintain the right params
  useLayoutEffect(() => {
    if (!settings) {
      return;
    }

    // Remove the old ?c= param
    if (searchParams.has(configLegacyQueryKey)) {
      setSearchParams(
        (s) => {
          s.delete(configLegacyQueryKey);
          return s;
        },
        { replace: true },
      );
    }

    // If there is no valid config source or the config source equals the default, remove the ?app-config= param
    if (searchParams.has(configQueryKey) && (!configSource || configSource === settings?.defaultConfigSource)) {
      setSearchParams(
        (s) => {
          s.delete(configQueryKey);

          return s;
        },
        { replace: true },
      );
    }

    // If the config source is not the default and the query string isn't set right, set the ?app-config= param
    if (configSource && configSource !== settings?.defaultConfigSource && searchParams.get(configQueryKey) !== configSource) {
      setSearchParams(
        (s) => {
          s.set(configQueryKey, configSource);
          return s;
        },
        { replace: true },
      );
    }
  }, [configSource, searchParams, setSearchParams, configQueryKey, configLegacyQueryKey, configSource, settings]);

  return configSource;
}

function isValidConfigSource(source: string, settings: Settings) {
  // Dynamic values are valid as long as they are defined
  if (settings?.UNSAFE_allowAnyConfigSource) {
    return !!source;
  }

  return (
    settings?.defaultConfigSource === source || (settings?.additionalAllowedConfigSources && settings?.additionalAllowedConfigSources.indexOf(source) >= 0)
  );
}
