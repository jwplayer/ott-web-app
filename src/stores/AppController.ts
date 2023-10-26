import merge from 'lodash.merge';
import { injectable } from 'inversify';
import ini from 'ini';

import { IntegrationInfo, useConfigStore } from '#src/stores/ConfigStore';
import ConfigService from '#src/services/config.service';
import { Settings, useSettingsStore } from '#src/stores/SettingsStore';
import { logDev } from '#src/utils/common';
import { OTT_GLOBAL_PLAYER_ID, CONFIG_FILE_STORAGE_KEY, CONFIG_QUERY_KEY } from '#src/config';
import type { Config } from '#types/Config';
import { ConfigError, SettingsError } from '#src/utils/error';

// Use local storage so the override persists until cleared
const storage = window.localStorage;

@injectable()
export default class AppController {
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

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

  initAppSettings = async () => {
    const settings = await fetch('/.webapp.ini')
      .then((result) => result.text())
      .then((iniString) => ini.parse(iniString) as Settings)
      .catch((e) => {
        logDev(e);
        // It's possible to not use the ini settings files, so an error doesn't have to be fatal
        return {} as Settings;
      });

    if (!settings) {
      throw new SettingsError('Unable to load .webapp.ini');
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
      throw new SettingsError('No usable config sources');
    }

    useSettingsStore.setState(settings);

    return settings;
  };

  loadAndValidateConfig = async (configSource: string | undefined) => {
    const configLocation = this.configService.formatSourceLocation(configSource);
    const defaultConfig = this.configService.getDefaultConfig();
    let config: Config | null = null;

    if (!configLocation) {
      useConfigStore.setState({ config: defaultConfig });
      throw new ConfigError('Config not defined');
    }

    try {
      config = await this.configService.loadConfig(configLocation);
    } catch (err: unknown) {
      throw new ConfigError('Config not found');
    }

    if (!config) {
      throw new ConfigError('Config not found');
    }

    config.id = configSource;
    config.assets = config.assets || {};

    // make sure the banner always defaults to the JWP banner when not defined in the config
    if (!config.assets.banner) {
      config.assets.banner = defaultConfig.assets.banner;
    }

    // Store the logo right away and set css variables so the error page will be branded
    const banner = config.assets.banner;

    useConfigStore.setState((s) => {
      s.config.assets.banner = banner;
    });

    this.configService.setCssVariables(config.styling || {});

    config = await this.configService.validateConfig(config);
    config = merge({}, defaultConfig, config);

    const accessModel = this.configService.calculateAccessModel(config);

    useConfigStore.setState({ config, accessModel });

    this.configService.maybeInjectAnalyticsLibrary(config);

    if (config.adSchedule) {
      const adScheduleData = await this.configService.loadAdSchedule(config?.adSchedule);
      useConfigStore.setState({ adScheduleData });
    }

    return config;
  };

  isValidConfigSource = (source: string, settings: Settings) => {
    // Dynamic values are valid as long as they are defined
    if (settings?.UNSAFE_allowAnyConfigSource) {
      return !!source;
    }

    return (
      settings?.defaultConfigSource === source || (settings?.additionalAllowedConfigSources && settings?.additionalAllowedConfigSources.indexOf(source) >= 0)
    );
  };

  loadResources = async () => {
    const settings = await this.initAppSettings();
    const configSource = this.getConfigSource(settings);

    const config = await this.loadAndValidateConfig(configSource);

    return { configSource, config, settings };
  };

  getIntegration = (): IntegrationInfo => {
    return useConfigStore.getState().getIntegration();
  };
}
