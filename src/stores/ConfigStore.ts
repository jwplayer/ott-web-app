import { createStore } from './utils';

import type { AccessModel, Config, IntegrationType } from '#types/config';
import { ACCESS_MODEL, OTT_GLOBAL_PLAYER_ID } from '#src/config';

export interface Settings {
  defaultConfigSource?: string;
  playerId: string;
  playerLicenseKey?: string;
  additionalAllowedConfigSources?: string[];
  UNSAFE_allowAnyConfigSource?: boolean;
}

type ConfigState = {
  loaded: boolean;
  config: Config;
  accessModel: AccessModel;
  settings: Settings;
  integrationType: IntegrationType | null;
  isSandbox: boolean;
  clientId: string | null;
  offers: string[];
};

export const useConfigStore = createStore<ConfigState>('ConfigStore', () => ({
  loaded: false,
  config: {
    id: '',
    siteName: '',
    description: '',
    player: '',
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
    styling: {
      footerText: '',
    },
  },
  settings: {
    additionalAllowedConfigSources: [],
    playerId: OTT_GLOBAL_PLAYER_ID,
  },
  accessModel: ACCESS_MODEL.SVOD,
  integrationType: null,
  isSandbox: true,
  clientId: null,
  offers: [],
}));
