import { injectable } from 'inversify';
import ini from 'ini';
import { getI18n } from 'react-i18next';

import { CONFIG_FILE_STORAGE_KEY, CONFIG_QUERY_KEY, OTT_GLOBAL_PLAYER_ID } from '../constants';
import { logDev } from '../utils/common';
import { AppError } from '../utils/error';
import type { Settings } from '../../types/settings';
import env from '../env';

import StorageService from './StorageService';

@injectable()
export default class SettingsService {
  private readonly storageService;

  constructor(storageService: StorageService) {
    this.storageService = storageService;
  }

  async getConfigSource(settings: Settings | undefined, url: string) {
    if (!settings) {
      return '';
    }

    const urlParams = new URLSearchParams(url.split('?')[1]);
    const configKey = urlParams.get(CONFIG_QUERY_KEY);

    // Skip all the fancy logic below if there aren't any other options besides the default anyhow
    if (!settings.UNSAFE_allowAnyConfigSource && (settings.additionalAllowedConfigSources?.length || 0) <= 0) {
      return settings.defaultConfigSource;
    }

    if (configKey !== null) {
      // If the query param exists but the value is empty, clear the storage and allow fallback to the default config
      if (!configKey) {
        await this.storageService.removeItem(CONFIG_FILE_STORAGE_KEY);
        return settings.defaultConfigSource;
      }

      // If it's valid, store it and return it
      if (this.isValidConfigSource(configKey, settings)) {
        await this.storageService.setItem(CONFIG_FILE_STORAGE_KEY, configKey);
        return configKey;
      }

      logDev(`Invalid app-config query param: ${configKey}`);
    }
    // Yes this falls through from above to look up the stored value if the query string is invalid and that's OK

    const storedSource = await this.storageService.getItem(CONFIG_FILE_STORAGE_KEY, false);

    // Make sure the stored value is still valid before returning it
    if (storedSource && typeof storedSource === 'string') {
      if (this.isValidConfigSource(storedSource, settings)) {
        return storedSource;
      }

      logDev('Invalid stored config: ' + storedSource);
      await this.storageService.removeItem(CONFIG_FILE_STORAGE_KEY);
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

    // @TODO: use `i18next.t()`?
    // t('error:settings_invalid')
    // t('error:check_your_settings')
    const errorPayload = {
      title: i18n.t('error:settings_invalid'),
      description: i18n.t('error:check_your_settings'),
      helpLink: 'https://github.com/jwplayer/ott-web-app/blob/develop/docs/initialization-file.md',
    };

    if (!settings) {
      throw new AppError('Unable to load .webapp.ini', errorPayload);
    }

    // The ini file values will be used if provided, even if compile-time values are set
    settings.defaultConfigSource ||= env.APP_DEFAULT_CONFIG_SOURCE;
    settings.playerId ||= env.APP_PLAYER_ID || OTT_GLOBAL_PLAYER_ID;
    settings.playerLicenseKey ||= env.APP_PLAYER_LICENSE_KEY;

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
