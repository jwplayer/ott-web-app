import { Store } from 'pullstate';
import type { AccessModel, Config } from 'types/Config';

type ConfigStore = {
  configLocation: string;
  isLoading: boolean;
  config: Config;
  accessModel: AccessModel;
};

export const ConfigStore = new Store<ConfigStore>({
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
});
