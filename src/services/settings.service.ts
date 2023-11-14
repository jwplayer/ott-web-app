import { injectable } from 'inversify';
import ini from 'ini';
import { getI18n } from 'react-i18next';

import type { Settings } from '#types/settings';
import { CONFIG_FILE_STORAGE_KEY, CONFIG_QUERY_KEY, OTT_GLOBAL_PLAYER_ID } from '#src/config';
import { logDev } from '#src/utils/common';
import { AppError } from '#src/utils/error';

// Use local storage so the override persists until cleared
const storage = window.localStorage;

@injectable()
export default class SettingsService {
  getConfigSource(settings: Settings | undefined) {
    if (!settings) {
      return '';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const configKey = urlParams.get(CONFIG_QUERY_KEY);

    // Skip all the fancy logic below if there aren't any other options besides the default anyhow
    if (!settings.UNSAFE_allowAnyConfigSource && (settings.additionalAllowedConfigSources?.length || 0) <= 0) {
      return settings.defaultConfigSource;
    }

    if (configKey !== null) {
      // If the query param exists but the value is empty, clear the storage and allow fallback to the default config
      if (!configKey) {
        storage.removeItem(CONFIG_FILE_STORAGE_KEY);
        return settings.defaultConfigSource;
      }

      // If it's valid, store it and return it
      if (this.isValidConfigSource(configKey, settings)) {
        storage.setItem(CONFIG_FILE_STORAGE_KEY, configKey);
        return configKey;
      }

      logDev(`Invalid app-config query param: ${configKey}`);
    }
    // Yes this falls through from above to look up the stored value if the query string is invalid and that's OK

    const storedSource = storage.getItem(CONFIG_FILE_STORAGE_KEY);

    // Make sure the stored value is still valid before returning it
    if (storedSource) {
      if (this.isValidConfigSource(storedSource, settings)) {
        return storedSource;
      }

      logDev('Invalid stored config: ' + storedSource);
      storage.removeItem(CONFIG_FILE_STORAGE_KEY);
    }

    return settings.defaultConfigSource;
  }

  isValidConfigSource = (source: string, settings: Settings) => {
    // Dynamic values are valid as long as they are defined
    if (settings?.UNSAFE_allowAnyConfigSource) {
      return !!source;
    }

    return (
      settings?.defaultConfigSource === source || (settings?.additionalAllowedConfigSources && settings?.additionalAllowedConfigSources.indexOf(source) >= 0)
    );
  };

  initialize = async () => {
    const settings = await fetch('/.webapp.ini')
      .then((result) => result.text())
      .then((iniString) => ini.parse(iniString) as Settings)
      .catch((e) => {
        logDev(e);
        // It's possible to not use the ini settings files, so an error doesn't have to be fatal
        return {} as Settings;
      });

    const i18n = getI18n();
    const bundle = i18n.getResourceBundle(i18n.language, 'error');

    const errorPayload = {
      title: bundle['settings_invalid'],
      description: bundle['check_your_settings'],
      helpLink: 'https://github.com/jwplayer/ott-web-app/blob/develop/docs/initialization-file.md',
    };

    if (!settings) {
      throw new AppError('Unable to load .webapp.ini', errorPayload);
    }

    // The ini file values will be used if provided, even if compile-time values are set
    settings.defaultConfigSource ||= import.meta.env.APP_DEFAULT_CONFIG_SOURCE;
    settings.playerId ||= import.meta.env.APP_PLAYER_ID || OTT_GLOBAL_PLAYER_ID;
    settings.playerLicenseKey ||= import.meta.env.APP_PLAYER_LICENSE_KEY;

    // The player key should be set if using the global ott player
    if (settings.playerId === OTT_GLOBAL_PLAYER_ID && !settings.playerLicenseKey) {
      console.warn('Using Global OTT Player without setting player key. Some features, such as analytics, may not work correctly.');
    }

    // This will result in an unusable app
    if (
      !settings.defaultConfigSource &&
      (!settings.additionalAllowedConfigSources || settings.additionalAllowedConfigSources?.length === 0) &&
      !settings.UNSAFE_allowAnyConfigSource
    ) {
      throw new AppError('No usable config sources', errorPayload);
    }

    return settings;
  };
}
