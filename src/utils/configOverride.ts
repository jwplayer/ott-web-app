import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router';

import { logDev } from '#src/utils/common';
import type { Settings } from '#src/stores/SettingsStore';

// Use session storage so the override persists until the tab is closed and then resets
const storage = window.sessionStorage;

const configQueryKey = 'app-config';
const configLegacyQueryKey = 'c';

const configFileStorageKey = 'config-file-override';

export function useConfigSource(settings: Settings | undefined) {
  return useConfigOverride(settings) || settings?.defaultConfigSource;
}

export function useConfigNavigate() {
  const navigate = useNavigate();

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

function useConfigOverride(settings?: Settings) {
  const [searchParams, setSearchParams] = useSearchParams();
  if (!settings?.unsafeAllowAnyConfigSource && (settings?.allowedConfigSources?.length || 0) <= 0) {
    return undefined;
  }

  // If the query string has the legacy key, remove it
  if (searchParams.has(configLegacyQueryKey)) {
    const legacyValue = searchParams.get(configLegacyQueryKey);
    searchParams.delete(configLegacyQueryKey);

    // If the new query key is not set, set it from the old key, but do not replace it (the new key 'wins' if both are set)
    if (legacyValue !== null && !searchParams.has(configQueryKey)) {
      searchParams.set(configQueryKey, legacyValue);
    }

    setSearchParams(searchParams, { replace: true });
  }

  if (searchParams.has(configQueryKey)) {
    const configQuery = searchParams.get(configQueryKey);

    // If the query param exists but the value is empty, clear the storage and allow fallback to the default config
    if (!configQuery) {
      storage.removeItem(configFileStorageKey);

      searchParams.delete(configQueryKey);
      setSearchParams(searchParams, { replace: true });

      return undefined;
    }

    // If it's valid, store it and return it
    if (isValidConfigSource(configQuery, settings)) {
      storage.setItem(configFileStorageKey, configQuery);
      return configQuery;
    }

    logDev(`Invalid app-config query param: ${configQuery}`);

    // Remove the query param if it's invalid
    searchParams.delete(configQueryKey);
    setSearchParams(searchParams, { replace: true });
  }
  // Yes this falls through from above to look up the stored value if the query string is invalid and that's OK

  const storedSource = storage.getItem(configFileStorageKey);

  // Make sure the stored value is still valid before returning it
  if (storedSource) {
    if (isValidConfigSource(storedSource, settings)) {
      // Make sure it's added to the query params if it's not the default
      if (settings?.unsafeAllowAnyConfigSource || storedSource !== settings?.defaultConfigSource) {
        searchParams.set(configQueryKey, storedSource);
        setSearchParams(searchParams, { replace: true });
      }

      return storedSource;
    }

    logDev('Invalid stored config: ' + storedSource);
    storage.removeItem(configFileStorageKey);
  }

  return undefined;
}

function isValidConfigSource(source: string, settings: Settings | undefined) {
  // Dynamic values are valid as long as they are defined
  if (settings?.unsafeAllowAnyConfigSource) {
    return !!source;
  }

  return settings?.defaultConfigSource === source || (settings?.allowedConfigSources && settings?.allowedConfigSources.indexOf(source) >= 0);
}
