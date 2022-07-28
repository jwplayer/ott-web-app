import { IS_DEV_OR_TEST_BUILD, API_HOST, INCLUDE_CONFIGS, UNSAFE_ALLOW_DYNAMIC_CONFIG, CONFIG_DEFAULT_SOURCE, CONFIG_ALLOWED_SOURCES } from '#src/env';
import { useUIStore } from '#src/stores/UIStore';

// In production, use local storage so the override persists indefinitely without the query string
// In dev mode, use session storage so the override persists until the tab is closed and then resets
const storage = IS_DEV_OR_TEST_BUILD ? window.sessionStorage : window.localStorage;

const configFileQueryKey = 'c';
const configFileStorageKey = 'config-file-override';

export function getConfig() {
  return formatSourceLocation(getConfigOverride() || CONFIG_DEFAULT_SOURCE);
}

export const setStoredConfig = (value: string) => {
  storage.setItem(configFileStorageKey, value);
};

export const getStoredConfig = () => {
  return storage.getItem(configFileStorageKey);
};

export const clearStoredConfig = () => {
  storage.removeItem(configFileStorageKey);
};

function getConfigOverride() {
  const url = new URL(window.location.href);

  if (url.searchParams.has(configFileQueryKey)) {
    useUIStore.setState({ showDebugTools: false });

    const configQuery = url.searchParams.get(configFileQueryKey);

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
  } else {
    if (INCLUDE_CONFIGS !== 'dev') {
      useUIStore.setState({ showDebugTools: true });
    }
  }

  const storedSource = getStoredConfig();

  // Make sure the stored value is still valid before returning it
  if (storedSource && isValidConfigSource(storedSource)) {
    return storedSource;
  }

  return undefined;
}

function isValidConfigSource(source: string) {
  // Dynamic values are valid as long as they are defined, value can be 0 | 1
  if (Number(UNSAFE_ALLOW_DYNAMIC_CONFIG)) {
    return !!source;
  }

  return CONFIG_ALLOWED_SOURCES.indexOf(source) >= 0;
}

function formatSourceLocation(source?: string) {
  if (!source) {
    return undefined;
  }

  if (['prod', 'test', 'dev'].includes(INCLUDE_CONFIGS) && source.includes('--config')) {
    return `/configs/${INCLUDE_CONFIGS}/${source}.json`;
  }

  if (source.match(/^[a-z,\d]{8}$/)) {
    return `${API_HOST}/apps/configs/${source}.json`;
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
