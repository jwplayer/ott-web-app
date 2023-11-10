import merge from 'lodash.merge';
import { inject, injectable } from 'inversify';

import AccountController from './AccountController';
import WatchHistoryController from './WatchHistoryController';
import FavoritesController from './FavoritesController';

import type { Config } from '#types/Config';
import { IntegrationInfo, useConfigStore } from '#src/stores/ConfigStore';
import ConfigService from '#src/services/config.service';
import SettingsService from '#src/services/settings.service';
import { PersonalShelf } from '#src/config';
import { ConfigError } from '#src/utils/error';
import { getModule } from '#src/container';
import { logDev } from '#src/utils/common';

type IntegrationRegistration = {
  name: string;
  selector: (config: Config) => boolean;
  register: (config: Config) => Promise<void> | void;
};

@injectable()
export default class AppController {
  private readonly configService: ConfigService;
  private readonly settingsService: SettingsService;

  private integrationRegistrations: IntegrationRegistration[] = [];

  constructor(@inject(ConfigService) configService: ConfigService, @inject(SettingsService) settingsService: SettingsService) {
    this.configService = configService;
    this.settingsService = settingsService;
  }

  registerIntegration(registration: IntegrationRegistration) {
    this.integrationRegistrations.push(registration);
  }

  async loadIntegration(config: Config) {
    const registration = this.integrationRegistrations.find(({ selector }) => selector(config));

    if (registration) {
      logDev(`Found integration: ${registration.name}`);
      await registration.register(config);
    }
  }

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

  initApp = async () => {
    const settings = await this.settingsService.initialize();
    const configSource = this.settingsService.getConfigSource(settings);
    const config = await this.loadAndValidateConfig(configSource);

    // update settings in the config store
    useConfigStore.setState({ settings });

    // load the integration based on the app config
    await this.loadIntegration(config);

    if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
      await getModule(WatchHistoryController).restoreWatchHistory();
    }

    if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
      await getModule(FavoritesController).initializeFavorites();
    }

    if (this.getIntegration().integrationType) {
      await getModule(AccountController).initializeAccount();
    }

    return { config, settings, configSource };
  };

  getIntegration = (): IntegrationInfo => {
    return useConfigStore.getState().getIntegration();
  };
}
