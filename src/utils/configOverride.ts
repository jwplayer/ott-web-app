// Use session storage so the override persists until the tab is closed and then resets
import { logDev } from '#src/utils/common';

const storage = window.sessionStorage;

export const configQueryKey = 'app-config';
const configLegacyQueryKey = 'c';

const configFileStorageKey = 'config-file-override';

const DEFAULT_CONFIG_SOURCE = import.meta.env.APP_CONFIG_DEFAULT_SOURCE;
const ALLOWED_SOURCES = import.meta.env.APP_CONFIG_ALLOWED_SOURCES?.split(' ').filter((c) => c.toLowerCase() !== DEFAULT_CONFIG_SOURCE?.toLowerCase()) || [];
const UNSAFE_ALLOW_DYNAMIC_CONFIG = ['1', 'true'].includes(import.meta.env.APP_UNSAFE_ALLOW_DYNAMIC_CONFIG?.toLowerCase() || '');

export function getConfigLocation() {
  // Require a default source unless the dynamic (demo) mode is enabled
  if (!DEFAULT_CONFIG_SOURCE && !UNSAFE_ALLOW_DYNAMIC_CONFIG) {
    throw 'A default config is required';
  }

  return getConfigOverride() || DEFAULT_CONFIG_SOURCE;
}

export function maintainConfigQueryParam() {
  const selectedConfig = getConfigLocation();

  // Make sure the config location is appended to the url,
  // but only when dynamic (demo) mode is enabled or using multiple configs and not the default
  if (selectedConfig && (UNSAFE_ALLOW_DYNAMIC_CONFIG || selectedConfig !== DEFAULT_CONFIG_SOURCE)) {
    console.info(UNSAFE_ALLOW_DYNAMIC_CONFIG);
    console.info(selectedConfig !== DEFAULT_CONFIG_SOURCE);

    const url = new URL(window.location.href);

    if (url.searchParams.get(configQueryKey) !== selectedConfig) {
      url.searchParams.set(configQueryKey, selectedConfig);

      window.history.replaceState(null, '', url.toString());
    }
  }
}

const getStoredConfig = () => {
  return storage.getItem(configFileStorageKey);
};

export const clearStoredConfig = () => {
  storage.removeItem(configFileStorageKey);
};

function getConfigOverride() {
  if (!UNSAFE_ALLOW_DYNAMIC_CONFIG && ALLOWED_SOURCES.length <= 0) {
    return undefined;
  }

  const url = new URL(window.location.href);

  // If the query string has the legacy key, remove it
  if (url.searchParams.has(configLegacyQueryKey)) {
    const legacyValue = url.searchParams.get(configLegacyQueryKey);
    url.searchParams.delete(configLegacyQueryKey);

    // If the new query key is not set, set it from the old key, but do not replace it (the new key 'wins' if both are set)
    if (legacyValue !== null && !url.searchParams.has(configQueryKey)) {
      url.searchParams.set(configQueryKey, legacyValue);
    }

    window.history.replaceState(null, '', url.toString());
  }

  if (url.searchParams.has(configQueryKey)) {
    const configQuery = url.searchParams.get(configQueryKey);

    // If the query param exists but the value is empty, clear the storage and allow fallback to the default config
    if (!configQuery) {
      clearStoredConfig();
      return undefined;
    }

    // If it's valid, store it and return it
    if (isValidConfigSource(configQuery)) {
      storage.setItem(configFileStorageKey, configQuery);
      return configQuery;
    }

    logDev(`Invalid app-config: ${configQuery}`);

    // Yes this falls through to look up the stored value if the query string is invalid and that's OK
  }

  const storedSource = getStoredConfig();

  // Make sure the stored value is still valid before returning it
  if (storedSource && isValidConfigSource(storedSource)) {
    return storedSource;
  }

  return undefined;
}

function isValidConfigSource(source: string) {
  // Dynamic values are valid as long as they are defined
  if (UNSAFE_ALLOW_DYNAMIC_CONFIG) {
    return !!source;
  }

  return DEFAULT_CONFIG_SOURCE === source || ALLOWED_SOURCES.indexOf(source) >= 0;
}
