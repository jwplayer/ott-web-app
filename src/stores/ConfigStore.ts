import { Store } from 'pullstate';
import type { Config } from 'types/Config';

type ConfigStore = {
  configLocation: string;
  isLoading: boolean;
  config: Config;
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
      shelveTitles: true,
    },
  },
});
