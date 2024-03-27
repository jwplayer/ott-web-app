import { ACCESS_MODEL, OTT_GLOBAL_PLAYER_ID } from '../constants';
import type { AccessModel, Config } from '../../types/config';
import type { Settings } from '../../types/settings';
import type { LanguageDefinition } from '../../types/i18n';

import { createStore } from './utils';

type ConfigState = {
  loaded: boolean;
  config: Config;
  accessModel: AccessModel;
  settings: Settings;
  integrationType: string | null;
  supportedLanguages: LanguageDefinition[];
};

export const useConfigStore = createStore<ConfigState>('ConfigStore', () => ({
  loaded: false,
  config: {
    id: '',
    siteName: '',
    description: '',
    player: '',
    siteId: '',
    assets: {},
    content: [],
    menu: [],
    integrations: {
      cleeng: {
        useSandbox: true,
      },
      jwp: {
        clientId: null,
        assetId: null,
        useSandbox: true,
      },
    },
    styling: {},
  },
  settings: {
    additionalAllowedConfigSources: [],
    playerId: OTT_GLOBAL_PLAYER_ID,
  },
  supportedLanguages: [],
  accessModel: ACCESS_MODEL.AVOD,
  integrationType: null,
}));
