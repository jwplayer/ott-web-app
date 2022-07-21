import { IS_DEV_BUILD } from '#src/utils/common';

// In production, use local storage so the override persists indefinitely without the query string
// In dev mode, use session storage so the override persists until the tab is closed and then resets
const storage = IS_DEV_BUILD ? window.sessionStorage : window.localStorage;
const CONFIG_HOST = import.meta.env.APP_API_BASE_URL;
const INCLUDE_TEST_CONFIGS = import.meta.env.APP_INCLUDE_TEST_CONFIGS;

const configFileQueryKey = 'c';
const configFileStorageKey = 'config-file-override';

const DEFAULT_SOURCE = import.meta.env.APP_CONFIG_DEFAULT_SOURCE?.toLowerCase();
const ALLOWED_SOURCES = import.meta.env.APP_CONFIG_ALLOWED_SOURCES?.split(' ').map((source) => source.toLowerCase()) || [];
const UNSAFE_ALLOW_DYNAMIC_CONFIG = import.meta.env.APP_UNSAFE_ALLOW_DYNAMIC_CONFIG;

export function getConfig() {
  return formatSourceLocation(getConfigOverride() || DEFAULT_SOURCE);
}

export const setStoredConfig = (value: string) => {
  storage.setItem(configFileStorageKey, value);
};

export const getStoredConfig = () => {
  return storage.getItem(configFileStorageKey)?.toLowerCase();
};

export const clearStoredConfig = () => {
  storage.removeItem(configFileStorageKey);
};

function getConfigOverride() {
  const url = new URL(window.location.href);

  if (url.searchParams.has(configFileQueryKey)) {
    const configQuery = url.searchParams.get(configFileQueryKey)?.toLowerCase();

    // Strip the config file query param from the URL and history since it's stored locally,
    // and then the url stays clean and the user will be less likely to play with the param
    url.searchParams.delete(configFileQueryKey);
    window.history.replaceState(null, '', url.toString());

    // If the query param exists but the value is empty, clear the storage and allow fallback to the default config
    if (!configQuery) {
      clearStoredConfig();
      return undefined;
    }

    // If it's valid, store it and return it
    if (isValidConfigSource(configQuery)) {
      setStoredConfig(configQuery);
      return configQuery;
    }

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

  if (INCLUDE_TEST_CONFIGS && source.startsWith('test--')) {
    return true;
  }

  return ALLOWED_SOURCES.indexOf(source) >= 0;
}

function formatSourceLocation(source?: string) {
  if (!source) {
    return undefined;
  }

  if (source.match(/^[a-z,\d]{8}$/)) {
    return `${CONFIG_HOST}/apps/configs/${source}.json`;
  }

  if (INCLUDE_TEST_CONFIGS && source.startsWith('test--')) {
    return `/test-data/config.${source}.json`;
  }

  return source;
}

/***
 * If present, re-add the config override key to the query string of the share url,
 * so the url copied will pull up the same site config
 * @param href The URL to append to as a string (i.e. window.location.href)
 */
export function addConfigParamToUrl(href: string) {
  const config = getConfigOverride();
  const url = new URL(href);

  url.searchParams.delete(configFileQueryKey);

  if (config) {
    url.searchParams.append(configFileQueryKey, config);
  }

  return url.toString();
}
