import { createStore } from './utils';

import type { AccessModel, Config } from '#types/Config';

type ConfigState = {
  configLocation: string;
  isLoading: boolean;
  config: Config;
  accessModel: AccessModel;
};

export const useConfigStore = createStore<ConfigState>('ConfigStore', () => ({
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
}));
