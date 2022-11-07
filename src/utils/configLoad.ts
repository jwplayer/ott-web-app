import merge from 'lodash.merge';

import { calculateContrastColor } from '../utils/common';
import { getConfigLocation } from '../utils/configOverride';
import loadConfig, { validateConfig } from '../services/config.service';
import { addScript } from '../utils/dom';
import { useConfigStore } from '../stores/ConfigStore';

import type { AccessModel, Config, Styling } from '#types/Config';

const CONFIG_HOST = import.meta.env.APP_API_BASE_URL;

const defaultConfig: Config = {
  id: '',
  siteName: '',
  description: '',
  player: '',
  assets: {
    banner: '/images/logo.png',
  },
  content: [],
  menu: [],
  integrations: {
    cleeng: {
      id: null,
      useSandbox: true,
    },
  },
  styling: {
    footerText: '',
    shelfTitles: true,
  },
  features: {
    enableSharing: true,
  },
};

const setCssVariables = ({ backgroundColor, highlightColor, headerBackground }: Styling) => {
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
};

const maybeInjectAnalyticsLibrary = (config: Config) => {
  if (!config.analyticsToken) return;

  return addScript('/jwpltx.js');
};

const calculateAccessModel = (config: Config): AccessModel => {
  const { id, monthlyOffer, yearlyOffer } = config?.integrations?.cleeng || {};

  if (!id) return 'AVOD';
  if (!monthlyOffer && !yearlyOffer) return 'AUTHVOD';
  return 'SVOD';
};

export const loadAndValidateConfig = async (
  onLoading: (isLoading: boolean) => void,
  onValidationError: (error: Error) => void,
  onValidationCompleted: (config: Config) => Promise<void>,
) => {
  onLoading(true);

  try {
    const configLocation = formatSourceLocation(getConfigLocation());

    if (!configLocation) {
      onValidationError(new Error('Config not defined'));
      return;
    }

    let config = await loadConfig(configLocation);

    if (!config) {
      return;
    }

    config = await validateConfig(config);
    config = merge({}, defaultConfig, config);

    // make sure the banner always defaults to the JWP banner when not defined in the config
    if (!config.assets.banner) {
      config.assets.banner = defaultConfig.assets.banner;
    }

    const accessModel = calculateAccessModel(config);

    useConfigStore.setState({
      config: config,
      accessModel,
    });

    setCssVariables(config.styling);
    maybeInjectAnalyticsLibrary(config);
    await onValidationCompleted(config);

    return config;
  } catch (ex: unknown) {
    onValidationError(ex as Error);
    return;
  }
};

function formatSourceLocation(source?: string) {
  if (!source) {
    return undefined;
  }

  if (source.match(/^[a-z,\d]{8}$/)) {
    return `${CONFIG_HOST}/apps/configs/${source}.json`;
  }

  return source;
}
