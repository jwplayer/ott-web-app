import merge from 'lodash.merge';
import { injectable } from 'inversify';

import AccountController from './AccountController';
import WatchHistoryController from './WatchHistoryController';
import FavoritesController from './FavoritesController';

import type { Config } from '#types/Config';
import { IntegrationInfo, useConfigStore } from '#src/stores/ConfigStore';
import ConfigService from '#src/services/config.service';
import { PersonalShelf } from '#src/config';
import { ConfigError } from '#src/utils/error';
import { getModule } from '#src/container';
import { loadIntegration } from '#src/integrations';

@injectable()
export default class AppController {
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
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

  initApp = async (configId: string | undefined) => {
    const config = await this.loadAndValidateConfig(configId);

    await loadIntegration(config);

    if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
      await getModule(WatchHistoryController).restoreWatchHistory();
    }

    if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
      await getModule(FavoritesController).initializeFavorites();
    }

    if (this.getIntegration().integrationType) {
      await getModule(AccountController).initializeAccount();
    }

    return config;
  };

  getIntegration = (): IntegrationInfo => {
    return useConfigStore.getState().getIntegration();
  };
}
