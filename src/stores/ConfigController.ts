import merge from 'lodash.merge';
import { inject, injectable } from 'inversify';

import { useConfigStore } from '#src/stores/ConfigStore';
import type ConfigService from '#src/services/config.service';
import { SERVICES } from '#src/ioc/types';

@injectable()
export default class ConfigController {
  private configService: ConfigService;

  constructor(@inject(SERVICES.Config) configService: ConfigService) {
    this.configService = configService;
  }

  async initializeAdSchedule() {
    const { config } = useConfigStore.getState();

    const adScheduleData = await this.configService.loadAdSchedule(config?.adSchedule);

    useConfigStore.setState({
      adScheduleData,
    });
  }

  async loadAndValidateConfig(configSource: string | undefined) {
    const configLocation = this.configService.formatSourceLocation(configSource);
    const defaultConfig = this.configService.getDefaultConfig();

    if (!configLocation) {
      useConfigStore.setState({ config: defaultConfig });
      throw new Error('Config not defined');
    }

    let config = await this.configService.loadConfig(configLocation);

    if (!config) {
      throw new Error('Config not found');
    }

    config.id = configSource;
    config.assets = config.assets || {};

    // make sure the banner always defaults to the JWP banner when not defined in the config
    if (!config.assets.banner) {
      config.assets.banner = defaultConfig.assets.banner;
    }

    // Store the logo right away and set css variables so the error page will be branded
    useConfigStore.setState((s) => {
      s.config.assets.banner = config.assets.banner;
    });

    this.configService.setCssVariables(config.styling || {});

    config = await this.configService.validateConfig(config);
    config = merge({}, defaultConfig, config);

    const accessModel = this.configService.calculateAccessModel(config);

    useConfigStore.setState({ config, accessModel });

    this.configService.maybeInjectAnalyticsLibrary(config);

    if (config.adSchedule) {
      await this.initializeAdSchedule();
    }

    return config;
  }
}
