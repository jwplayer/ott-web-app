import { createStore } from './utils';

import type { AccessModel, Config } from '#types/Config';
import type { AdSchedule } from '#types/ad-schedule';

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
  adScheduleData: AdSchedule | null | undefined;
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
  accessModel: 'SVOD',
  adScheduleData: null,
  getCleengData: (): CleengData => {
    const cleeng = get().config?.integrations?.cleeng;

    const cleengId = cleeng?.id;
    const cleengSandbox = !!cleeng?.useSandbox;
    const monthlyOfferId = cleeng?.monthlyOffer || '';
    const yearlyOfferId = cleeng?.yearlyOffer || '';

    return { cleengId, cleengSandbox, monthlyOfferId, yearlyOfferId };
  },
}));
