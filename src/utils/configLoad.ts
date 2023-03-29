import merge from 'lodash.merge';

import { calculateContrastColor } from '#src/utils/common';
import loadConfig, { validateConfig } from '#src/services/config.service';
import { addScript } from '#src/utils/dom';
import { PersonalShelf, useConfigStore } from '#src/stores/ConfigStore';
import type { AccessModel, Config, Styling } from '#types/Config';
import { initializeAccount } from '#src/stores/AccountController';
import { restoreWatchHistory } from '#src/stores/WatchHistoryController';
import { initializeFavorites } from '#src/stores/FavoritesController';
import { initializeAdSchedule } from '#src/stores/ConfigController';

const CONFIG_HOST = import.meta.env.APP_API_BASE_URL;

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
  if (config?.integrations?.cleeng?.id) {
    return config?.integrations?.cleeng?.monthlyOffer || config?.integrations?.cleeng?.yearlyOffer ? 'SVOD' : 'AUTHVOD';
  }

  if (config?.integrations?.jwp?.clientId) {
    return config?.integrations?.jwp?.assetId ? 'SVOD' : 'AUTHVOD';
  }

  return 'AVOD';
};

export async function loadAndValidateConfig(configSource: string | undefined) {
  const configLocation = formatSourceLocation(configSource);

  // Explicitly set default config here as a local variable,
  // otherwise if it's a module level const, the merge below causes changes to nested properties
  const defaultConfig: Config = {
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

  if (!configLocation) {
    useConfigStore.setState({ config: defaultConfig });
    throw new Error('Config not defined');
  }

  let config = await loadConfig(configLocation);
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

  setCssVariables(config.styling || {});

  config = await validateConfig(config);
  config = merge({}, defaultConfig, config);

  const accessModel = calculateAccessModel(config);

  useConfigStore.setState({
    config: config,
    accessModel,
  });

  maybeInjectAnalyticsLibrary(config);

  if (config?.integrations?.cleeng?.id && config?.integrations?.jwp?.clientId) {
    throw new Error('Invalid client integration. You cannot have both Cleeng and JWP integrations enabled at the same time.');
  }

  if (config?.integrations?.cleeng?.id || config?.integrations?.jwp?.clientId) {
    await initializeAccount();
  }

  // We only request favorites and continue_watching data if there is a corresponding item in the content section
  // and a playlist in the features section.
  // We first initialize the account otherwise if we have favorites saved as externalData and in a local storage the sections may blink
  if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
    await restoreWatchHistory();
  }
  if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
    await initializeFavorites();
  }

  if (config.adSchedule) {
    await initializeAdSchedule();
  }

  return config;
}

function formatSourceLocation(source?: string) {
  if (!source) {
    return undefined;
  }

  if (source.match(/^[a-z,\d]{8}$/)) {
    return `${CONFIG_HOST}/apps/configs/${source}.json`;
  }

  return source;
}
