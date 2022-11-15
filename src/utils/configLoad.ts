import merge from 'lodash.merge';

import { calculateContrastColor } from '#src/utils/common';
import loadConfig, { validateConfig } from '#src/services/config.service';
import { addScript } from '#src/utils/dom';
import { useConfigStore, PersonalShelf } from '#src/stores/ConfigStore';
import type { AccessModel, Config, Styling } from '#types/Config';
import { initializeAccount } from '#src/stores/AccountController';
import { restoreWatchHistory } from '#src/stores/WatchHistoryController';
import { initializeFavorites } from '#src/stores/FavoritesController';

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

export async function loadAndValidateConfig(configSource: string | undefined) {
  configSource = formatSourceLocation(configSource);

  if (!configSource) {
    throw new Error('Config not defined');
  }

  let config = await loadConfig(configSource);

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

  if (config?.integrations?.cleeng?.id) {
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
