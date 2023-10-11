import i18next from 'i18next';
import { inject, injectable } from 'inversify';

import type ApiService from './api.service';
import { configSchema } from './schema';

import { calculateContrastColor } from '#src/utils/common';
import { addScript } from '#src/utils/dom';
import type { AccessModel, Config, Styling } from '#types/Config';
import { SERVICES } from '#src/ioc/types';
import { ACCESS_MODEL } from '#src/config';

/**
 * Set config setup changes in both config.service.ts and config.d.ts
 * */

@injectable()
export default class ConfigService {
  private CONFIG_HOST = import.meta.env.APP_API_BASE_URL;
  // Explicitly set default config here as a local variable,
  // otherwise if it's a module level const, the merge below causes changes to nested properties
  private DEFAULT_CONFIG: Config = {
    id: '',
    siteName: '',
    description: '',
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

  private apiService: ApiService;

  constructor(@inject(SERVICES.Api) apiService: ApiService) {
    this.apiService = apiService;
  }

  private enrichConfig = (config: Config): Config => {
    const { content, siteName } = config;
    const updatedContent = content.map((content) => Object.assign({ featured: false }, content));

    return { ...config, siteName: siteName || i18next.t('common:default_site_name'), content: updatedContent };
  };

  getDefaultConfig(): Config {
    return this.DEFAULT_CONFIG;
  }

  validateConfig(config?: Config): Promise<Config> {
    return configSchema.validate(config, {
      strict: true,
    }) as Promise<Config>;
  }

  formatSourceLocation(source?: string) {
    if (!source) {
      return undefined;
    }

    if (source.match(/^[a-z,\d]{8}$/)) {
      return `${this.CONFIG_HOST}/apps/configs/${source}.json`;
    }

    return source;
  }

  async loadAdSchedule(adScheduleId: string | undefined | null) {
    return this.apiService.getAdSchedule(adScheduleId);
  }

  async loadConfig(configLocation: string) {
    if (!configLocation) {
      throw new Error('No config location found');
    }

    const response = await fetch(configLocation, {
      headers: {
        Accept: 'application/json',
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to load the config. Please check the config path and the file availability.');
    }

    const data = await response.json();

    if (!data) {
      throw new Error('No config found');
    }

    return this.enrichConfig(data);
  }

  setCssVariables({ backgroundColor, highlightColor, headerBackground }: Styling) {
    const root = document.querySelector(':root') as HTMLElement;

    if (root && backgroundColor) {
      root.style.setProperty('--body-background-color', backgroundColor);
      root.style.setProperty('--background-contrast-color', calculateContrastColor(backgroundColor));
    }

    if (root && highlightColor) {
      root.style.setProperty('--highlight-color', highlightColor);
      root.style.setProperty('--highlight-contrast-color', calculateContrastColor(highlightColor));
    }
    if (root && headerBackground) {
      root.style.setProperty('--header-background', headerBackground);
      root.style.setProperty('--header-contrast-color', calculateContrastColor(headerBackground));
    }
  }

  maybeInjectAnalyticsLibrary = (config: Config) => {
    if (!config.analyticsToken) return;

    return addScript('/jwpltx.js');
  };

  calculateAccessModel = (config: Config): AccessModel => {
    if (config?.integrations?.cleeng?.id) {
      return config?.integrations?.cleeng?.monthlyOffer || config?.integrations?.cleeng?.yearlyOffer ? ACCESS_MODEL.SVOD : ACCESS_MODEL.AUTHVOD;
    }

    if (config?.integrations?.jwp?.clientId) {
      return config?.integrations?.jwp?.assetId ? ACCESS_MODEL.SVOD : ACCESS_MODEL.AUTHVOD;
    }

    return ACCESS_MODEL.AVOD;
  };
}
