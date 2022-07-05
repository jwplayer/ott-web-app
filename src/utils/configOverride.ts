import { IS_DEV_BUILD } from '#src/utils/common';

// In production, use local storage so the override persists indefinitely without the query string
// In dev mode, use session storage so the override persists until the tab is closed and then resets
const storage = IS_DEV_BUILD ? window.sessionStorage : window.localStorage;

const configFileQueryKey = 'c';
const configFileStorageKey = 'config-file-override';

const defaultSource = import.meta.env.APP_CONFIG_DEFAULT_SOURCE.toLowerCase();
const allowedSources = import.meta.env.APP_CONFIG_ALLOWED_SOURCES?.split(' ').map((source) => source.toLowerCase()) || [];
const unsafeAllowDynamicSources = import.meta.env.APP_UNSAFE_ALLOW_DYNAMIC_CONFIG;

export function getConfig() {
  return formatSourceLocation(getConfigOverride() || defaultSource);
}

function getConfigOverride() {
  // Shortcut to determine if we can even use an override
  if (allowedSources.length <= 0 && !unsafeAllowDynamicSources) {
    return undefined;
  }

  const url = new URL(window.location.href);

  const configQuery = url.searchParams.get(configFileQueryKey)?.toLowerCase();

  if (configQuery) {
    // Strip the config file query param from the URL and history since it's stored locally,
    // and then the url stays clean and the user will be less likely to play with the param
    url.searchParams.delete(configFileQueryKey);
    window.history.replaceState(null, '', url.toString());

    // If it's valid, store it and return it
    if (isValidConfigSource(configQuery)) {
      storage.setItem(configFileStorageKey, configQuery);
      return configQuery;
    }
  }

  // If the query param exists but the value is empty, clear the storage and allow fallback to the default config
  if (url.searchParams.has(configFileQueryKey)) {
    clearStoredConfig();
    return undefined;
  }

  const storedSource = storage.getItem(configFileStorageKey)?.toLowerCase();

  // Make sure the stored value is still valid before returning it
  if (storedSource && isValidConfigSource(storedSource)) {
    return storedSource;
  }

  return undefined;
}

function isValidConfigSource(source: string) {
  // Dynamic values are valid as long as they are defined
  if (unsafeAllowDynamicSources) {
    return !!source;
  }

  return allowedSources.indexOf(source) >= 0;
}

function formatSourceLocation(source?: string) {
  if (!source) {
    return undefined;
  }

  if (source.match(/^[a-z,\d]{8}$/)) {
    return `https://cdn.jwplayer.com/apps/configs/${source}.json`;
  }

  if (IS_DEV_BUILD && source.startsWith('test--')) {
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

export function clearStoredConfig() {
  storage.removeItem(configFileStorageKey);
}
