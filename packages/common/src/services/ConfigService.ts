import i18next from 'i18next';
import { injectable } from 'inversify';
import { getI18n } from 'react-i18next';

import { configSchema } from '../utils/configSchema';
import { AppError } from '../utils/error';
import type { Config } from '../../types/config';
import env from '../env';

import ApiService from './ApiService';

/**
 * Set config setup changes in both config.service.ts and config.d.ts
 * */

@injectable()
export default class ConfigService {
  private CONFIG_HOST = env.APP_API_BASE_URL;
  // Explicitly set default config here as a local variable,
  // otherwise if it's a module level const, the merge below causes changes to nested properties
  private DEFAULT_CONFIG: Config = {
    id: '',
    siteName: '',
    description: '',
    siteId: '',
    assets: {
      banner: '/images/logo.png',
    },
    content: [],
    menu: [],
    integrations: {},
    styling: {
      footerText: '',
    },
    features: {},
  };

  private readonly apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  private enrichConfig = (config: Config): Config => {
    const { content, siteName } = config;
    const updatedContent = content.map((content) => Object.assign({ featured: false }, content));

    return { ...config, siteName: siteName || i18next.t('common:default_site_name'), content: updatedContent };
  };

  getDefaultConfig = (): Config => {
    return this.DEFAULT_CONFIG;
  };

  validateConfig = (config?: Config): Promise<Config> => {
    return configSchema.validate(config, {
      strict: true,
    }) as Promise<Config>;
  };

  formatSourceLocation = (source?: string) => {
    if (!source) {
      return undefined;
    }

    if (source.match(/^[a-z,\d]{8}$/)) {
      return `${this.CONFIG_HOST}/apps/configs/${source}.json`;
    }

    return source;
  };

  loadAdSchedule = async (adScheduleId: string | undefined | null) => {
    return this.apiService.getAdSchedule(adScheduleId);
  };

  loadConfig = async (configLocation: string | undefined) => {
    const i18n = getI18n();

    const errorPayload = {
      title: i18n.t('error:config_invalid'),
      description: i18n.t('error:check_your_config'),
      helpLink: 'https://github.com/jwplayer/ott-web-app/blob/develop/docs/configuration.md',
    };

    if (!configLocation) {
      throw new AppError('No config location found', errorPayload);
    }

    const response = await fetch(configLocation, {
      headers: {
        Accept: 'application/json',
      },
      method: 'GET',
    }).catch(() => {
      throw new AppError('Failed to load the config', errorPayload);
    });

    if (!response.ok) {
      throw new AppError('Failed to load the config', errorPayload);
    }

    const data = (await response.json()) as Config;

    if (!data) {
      throw new Error('No config found');
    }

    return this.enrichConfig(data);
  };
}
