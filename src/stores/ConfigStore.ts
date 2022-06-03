import { createStore } from './utils';

import type { AccessModel, Config } from '#types/Config';

type CleengData = {
  cleengId: string | null | undefined;
  cleengSandbox: boolean;
  monthlyOfferId: string;
  yearlyOfferId: string;
};

type ConfigState = {
  configLocation: string;
  isLoading: boolean;
  config: Config;
  accessModel: AccessModel;
  getCleengData: () => CleengData;
};

export const useConfigStore = createStore<ConfigState>('ConfigStore', (_, get) => ({
  configLocation: '',
  isLoading: false,
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
    },
    styling: {
      shelfTitles: true,
      footerText: '',
    },
  },
  accessModel: 'SVOD',
  getCleengData: (): CleengData => {
    const cleeng = get().config?.integrations?.cleeng;

    const cleengId = cleeng?.id;
    const cleengSandbox = !!cleeng?.useSandbox;
    const monthlyOfferId = cleeng?.monthlyOffer || '';
    const yearlyOfferId = cleeng?.yearlyOffer || '';

    return { cleengId, cleengSandbox, monthlyOfferId, yearlyOfferId };
  },
}));
