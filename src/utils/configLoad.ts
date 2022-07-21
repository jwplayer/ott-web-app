import merge from 'lodash.merge';

import { calculateContrastColor } from '../utils/common';
import { getConfig } from '../utils/configOverride';
import loadConfig, { validateConfig } from '../services/config.service';
import type { AccessModel, Config, Styling } from '../../types/Config';
import { addScript } from '../utils/dom';
import { useConfigStore } from '../stores/ConfigStore';

const defaultConfig: Config = {
  id: '',
  siteName: '',
  description: '',
  player: '',
  assets: {},
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
  onValidationCompleted: (config: Config) => void,
) => {
  onLoading(true);

  const configLocation = getConfig();

  if (!configLocation) {
    onValidationError(new Error('Config not defined'));
    return;
  }

  const config = await loadConfig(configLocation).catch((error) => {
    onValidationError(error);
  });

  if (!config) {
    onLoading(false);
    return;
  }

  await validateConfig(config)
    .then((configValidated) => {
      const configWithDefaults = merge({}, defaultConfig, configValidated);

      const accessModel = calculateAccessModel(configWithDefaults);

      useConfigStore.setState({
        config: configWithDefaults,
        accessModel,
      });

      setCssVariables(configValidated.styling);
      maybeInjectAnalyticsLibrary(config);
      onValidationCompleted(config);
    })
    .catch((error: Error) => {
      onValidationError(error);
    })
    .finally(() => {
      onLoading(false);
    });
};
