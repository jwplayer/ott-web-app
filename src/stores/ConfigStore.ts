import { createStore } from './utils';

import type { AccessModel, Config } from '#types/Config';
import { API_HOST, DEFAULT_PLAYER } from '#src/config';

export enum PersonalShelf {
  ContinueWatching = 'continue_watching',
  Favorites = 'favorites',
}

export const PersonalShelves = [PersonalShelf.Favorites, PersonalShelf.ContinueWatching];

type CleengData = {
  cleengId: string | null | undefined;
  cleengSandbox: boolean;
  monthlyOfferId: string;
  yearlyOfferId: string;
};

type ConfigState = {
  config: Config;
  accessModel: AccessModel;
  apiHost: string;
  getPlayer: () => string;
  getCleengData: () => CleengData;
};

export const useConfigStore = createStore<ConfigState>('ConfigStore', (_, get) => ({
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
      inplayer: {
        clientId: null,
        assetId: null,
        useSandbox: true,
      },
    },
    styling: {
      footerText: '',
    },
  },
  accessModel: 'SVOD',
  apiHost: import.meta.env.APP_API_BASE_URL || API_HOST.prd,
  getPlayer: (): string => {
    const host = get().apiHost;

    // For dev api host we use only one testing id, for prod it can be also set in .env file
    return host === API_HOST.dev ? DEFAULT_PLAYER.dev : import.meta.env.APP_DEFAULT_PLAYER ?? DEFAULT_PLAYER.prd;
  },
  getCleengData: (): CleengData => {
    const cleeng = get().config?.integrations?.cleeng;

    const cleengId = cleeng?.id;
    const cleengSandbox = !!cleeng?.useSandbox;
    const monthlyOfferId = cleeng?.monthlyOffer || '';
    const yearlyOfferId = cleeng?.yearlyOffer || '';

    return { cleengId, cleengSandbox, monthlyOfferId, yearlyOfferId };
  },
}));
