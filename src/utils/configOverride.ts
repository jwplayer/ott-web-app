import type { NavigateFunction } from 'react-router/dist/lib/hooks';

import { IS_PROD_MODE, logDev } from '#src/utils/common';
import type { Settings } from '#src/stores/SettingsStore';

// Use local storage so the override persists until cleared
const storage = window.localStorage;

const configQueryKey = 'app-config';
const configLegacyQueryKey = 'c';
const envQueryKey = 'env';

const configFileStorageKey = 'config-file-override';

export const getApiEnv = (searchParams: URLSearchParams): 'dev' | 'prd' => {
  const query = searchParams.get(envQueryKey);

  if (IS_PROD_MODE) {
    return 'prd';
  }

  if (query === 'dev' || query === 'prd') {
    return query;
  }

  return 'prd';
};

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

export function getConfigSource(searchParams: URLSearchParams, settings: Settings | undefined) {
  const env = getApiEnv(searchParams);

  if (!settings) {
    return { configSource: '', env };
  }

  // Skip all the fancy logic below if there aren't any other options besides the default anyhow
  if (!settings.UNSAFE_allowAnyConfigSource && (settings.additionalAllowedConfigSources?.length || 0) <= 0) {
    return { configSource: settings.defaultConfigSource, env };
  }

  const configQueryParam = searchParams.get(configQueryKey) ?? searchParams.get(configLegacyQueryKey);

  if (configQueryParam !== null) {
    // If the query param exists but the value is empty, clear the storage and allow fallback to the default config
    if (!configQueryParam) {
      storage.removeItem(configFileStorageKey);
      return { configSource: settings.defaultConfigSource, env };
    }

    // If it's valid, store it and return it
    if (isValidConfigSource(configQueryParam, settings)) {
      storage.setItem(configFileStorageKey, configQueryParam);
      return { configSource: configQueryParam, env };
    }

    logDev(`Invalid app-config query param: ${configQueryParam}`);
  }
  // Yes this falls through from above to look up the stored value if the query string is invalid and that's OK

  const storedSource = storage.getItem(configFileStorageKey);

  // Make sure the stored value is still valid before returning it
  if (storedSource) {
    if (isValidConfigSource(storedSource, settings)) {
      return { configSource: storedSource, env };
    }

    logDev('Invalid stored config: ' + storedSource);
    storage.removeItem(configFileStorageKey);
  }

  return { configSource: settings.defaultConfigSource, env };
}

export function cleanupQueryParams(searchParams: URLSearchParams, settings: Settings, configSource: string | undefined) {
  let anyTouched = false;

  // Remove the old ?c= param
  if (searchParams.has(configLegacyQueryKey)) {
    searchParams.delete(configLegacyQueryKey);
    anyTouched = true;
  }

  // If there is no valid config source or the config source equals the default, remove the ?app-config= param
  if (searchParams.has(configQueryKey) && (!configSource || configSource === settings?.defaultConfigSource)) {
    searchParams.delete(configQueryKey);
    anyTouched = true;
  }

  // If the config source is not the default and the query string isn't set right, set the ?app-config= param
  if (configSource && configSource !== settings?.defaultConfigSource && searchParams.get(configQueryKey) !== configSource) {
    searchParams.set(configQueryKey, configSource);
    anyTouched = true;
  }

  return anyTouched;
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
