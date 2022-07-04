import { IS_DEV_BUILD } from './common';

const configFileStorageKey = 'config-file-override';
export const configFileQueryKey = 'c';

function getStoredConfigOverride() {
  return window.sessionStorage.getItem(configFileStorageKey);
}

export function overrideConfig() {
  // This code is only used for (integration) testing and will be optimized away in production builds
  if (IS_DEV_BUILD || import.meta.env.APP_UNSAFE_ALLOW_DYNAMIC_CONFIG) {
    const url = new URL(window.location.href);

    const configFile = url.searchParams.get(configFileQueryKey) || getStoredConfigOverride();
    // Strip the config file query param from the URL since it's stored locally,
    // and then the url stays clean and the user will be less likely to play with the param
    if (url.searchParams.has(configFileQueryKey)) {
      url.searchParams.delete(configFileQueryKey);

      window.history.replaceState(null, '', url.toString());
    }

    // Use session storage to cache any config location override set from the url parameter so it can be restored
    // on subsequent navigation if the query string gets lost, but it doesn't persist if you close the tab
    if (configFile) {
      window.sessionStorage.setItem(configFileStorageKey, configFile);
    }

    window.configLocation = configFile ? `/test-data/config.${configFile}.json` : '/config.json';
  }
}

/***
 * If present, re-add the config override key to the query string of the share url,
 * so the url copied will pull up the same site config
 * @param href The URL to append to as a string (i.e. window.location.href)
 */
export function addConfigParamToUrl(href: string) {
  const config = getStoredConfigOverride();
  const url = new URL(href);

  url.searchParams.delete(configFileQueryKey);

  if (config) {
    url.searchParams.append(configFileQueryKey, config);
  }

  return url.toString();
}
