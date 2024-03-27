import merge from 'lodash.merge';
import { inject, injectable } from 'inversify';

import { PersonalShelf } from '../constants';
import SettingsService from '../services/SettingsService';
import ConfigService from '../services/ConfigService';
import { container, getModule } from '../modules/container';
import StorageService from '../services/StorageService';
import type { Config } from '../../types/config';
import type { CalculateIntegrationType } from '../../types/calculate-integration-type';
import { DETERMINE_INTEGRATION_TYPE } from '../modules/types';
import { useConfigStore } from '../stores/ConfigStore';

import WatchHistoryController from './WatchHistoryController';
import FavoritesController from './FavoritesController';
import AccountController from './AccountController';

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

    return config;
  };

  initializeApp = async (url: string, refreshEntitlements?: () => Promise<void>) => {
    const settings = await this.settingsService.initialize();
    const configSource = await this.settingsService.getConfigSource(settings, url);
    const config = await this.loadAndValidateConfig(configSource);
    const integrationType = this.calculateIntegrationType(config);

    // update the config store
    useConfigStore.setState({ config, loaded: true, integrationType });

    // we could add the configSource to the storage prefix, but this would cause a breaking change for end users
    // (since 'window.configId' isn't used anymore, all platforms currently use the same prefix)
    this.storageService.initialize('jwapp');

    // update settings in the config store
    useConfigStore.setState({ settings });

    // when an integration is set, we initialize the AccountController
    if (integrationType) {
      await getModule(AccountController).initialize(url, refreshEntitlements);
    }

    if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
      await getModule(WatchHistoryController).initialize();
    }

    if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
      await getModule(FavoritesController).initialize();
    }

    return { config, settings, configSource };
  };

  calculateIntegrationType = (config: Config) => {
    const registerIntegrationTypes = container.getAll<CalculateIntegrationType>(DETERMINE_INTEGRATION_TYPE);

    const activatedIntegrationTypes = registerIntegrationTypes.reduce((previousValue, calculateIntegrationType) => {
      const integrationType = calculateIntegrationType(config);

      return integrationType ? [...previousValue, integrationType] : previousValue;
    }, [] as string[]);

    if (activatedIntegrationTypes.length > 1) {
      throw new Error(`Failed to initialize app, more than 1 integrations are enabled: ${activatedIntegrationTypes.join(', ')}`);
    }

    return activatedIntegrationTypes[0] || null;
  };

  getIntegrationType = (): string | null => {
    const configState = useConfigStore.getState();

    if (!configState.loaded) throw new Error('A call to `AppController#getIntegrationType()` was made before loading the config');

    return configState.integrationType;
  };
}
