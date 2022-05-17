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
    footerText: '',
    player: '',
    assets: {},
    content: [],
    menu: [],
    cleengSandbox: true,
    options: {
      shelfTitles: true,
    },
  },
  accessModel: 'SVOD',
}));
