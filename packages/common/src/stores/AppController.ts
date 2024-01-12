import merge from 'lodash.merge';
import { inject, injectable } from 'inversify';

import { PersonalShelf } from '../constants';
import SettingsService from '../services/SettingsService';
import ConfigService from '../services/ConfigService';
import type { IntegrationType } from '../../types/config';
import { getModule } from '../modules/container';
import StorageService from '../services/StorageService';

import AccountController from './AccountController';
import WatchHistoryController from './WatchHistoryController';
import FavoritesController from './FavoritesController';
import { useConfigStore } from './ConfigStore';

@injectable()
export default class AppController {
  private readonly configService: ConfigService;
  private readonly settingsService: SettingsService;
  private readonly storageService: StorageService;

  constructor(
    @inject(ConfigService) configService: ConfigService,
    @inject(SettingsService) settingsService: SettingsService,
    @inject(StorageService) storageService: StorageService,
  ) {
    this.configService = configService;
    this.settingsService = settingsService;
    this.storageService = storageService;
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

    config = await this.configService.validateConfig(config);
    config = merge({}, defaultConfig, config);

    const accessModel = this.configService.calculateAccessModel(config);
    const { integrationType, clientId, isSandbox, offers } = this.configService.calculateIntegrationData(config);

    useConfigStore.setState({ config, accessModel, integrationType, clientId, isSandbox, offers, loaded: true });

    return config;
  };

  initializeApp = async (url: string) => {
    const settings = await this.settingsService.initialize();
    const configSource = await this.settingsService.getConfigSource(settings, url);
    const config = await this.loadAndValidateConfig(configSource);

    // we could add the configSource to the storage prefix, but this would cause a breaking change for end users
    // (since 'window.configId' isn't used anymore, all platforms currently use the same prefix)
    this.storageService.initialize('jwapp');

    // update settings in the config store
    useConfigStore.setState({ settings });

    if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
      await getModule(WatchHistoryController).initialize();
    }

    if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
      await getModule(FavoritesController).initialize();
    }

    if (this.getIntegrationType()) {
      await getModule(AccountController).initialize(url);
    }

    return { config, settings, configSource };
  };

  getIntegrationType = (): IntegrationType | null => {
    const configState = useConfigStore.getState();

    if (!configState.loaded) throw new Error('A call to `AppController#getIntegrationType()` was made before loading the config');

    return useConfigStore.getState().integrationType;
  };
}
