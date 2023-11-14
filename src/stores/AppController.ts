import merge from 'lodash.merge';
import { inject, injectable } from 'inversify';

import AccountController from './AccountController';
import WatchHistoryController from './WatchHistoryController';
import FavoritesController from './FavoritesController';

import type { IntegrationType } from '#types/Config';
import { useConfigStore } from '#src/stores/ConfigStore';
import ConfigService from '#src/services/config.service';
import SettingsService from '#src/services/settings.service';
import { PersonalShelf } from '#src/config';
import { getModule } from '#src/modules/container';

@injectable()
export default class AppController {
  private readonly configService: ConfigService;
  private readonly settingsService: SettingsService;

  constructor(@inject(ConfigService) configService: ConfigService, @inject(SettingsService) settingsService: SettingsService) {
    this.configService = configService;
    this.settingsService = settingsService;
  }

  loadAndValidateConfig = async (configSource: string | undefined) => {
    const configLocation = this.configService.formatSourceLocation(configSource);
    const defaultConfig = this.configService.getDefaultConfig();

    if (!configLocation) {
      useConfigStore.setState({ config: defaultConfig });
    }

    let config = await this.configService.loadConfig(configLocation);

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
    const { integrationType, clientId, isSandbox, offers } = this.configService.calculateIntegrationData(config);

    useConfigStore.setState({ config, accessModel, integrationType, clientId, isSandbox, offers, loaded: true });

    this.configService.maybeInjectAnalyticsLibrary(config);

    return config;
  };

  initializeApp = async () => {
    const settings = await this.settingsService.initialize();
    const configSource = this.settingsService.getConfigSource(settings);
    const config = await this.loadAndValidateConfig(configSource);

    // update settings in the config store
    useConfigStore.setState({ settings });

    if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
      await getModule(WatchHistoryController).initialize();
    }

    if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
      await getModule(FavoritesController).initialize();
    }

    if (this.getIntegrationType()) {
      await getModule(AccountController).initialize();
    }

    return { config, settings, configSource };
  };

  getIntegrationType = (): IntegrationType | null => {
    const configState = useConfigStore.getState();

    if (!configState.loaded) throw new Error('A call to `AppController#getIntegrationType()` was made before loading the config');

    return useConfigStore.getState().integrationType;
  };
}
