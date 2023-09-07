import { createStore } from '#src/utils/createStore';
import type { AccessModel, Config } from '#types/Config';
import type { AdSchedule } from '#types/ad-schedule';
import { ACCESS_MODEL } from '#src/config';

type ConfigState = {
  config: Config;
  accessModel: AccessModel;
  adScheduleData: AdSchedule | null | undefined;
  getSandbox: () => boolean;
  getAuthProvider: () => string | undefined;
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
  accessModel: ACCESS_MODEL.SVOD,
  adScheduleData: null,
  getSandbox: (): boolean => {
    const { cleeng, jwp } = get().config?.integrations;

    if (jwp?.clientId) return !!jwp?.useSandbox;

    if (cleeng?.id) return !!cleeng.useSandbox;

    return true;
  },

  getAuthProvider: (): string | undefined => {
    const { cleeng, jwp } = get().config?.integrations;

    if (jwp?.clientId) return jwp?.clientId?.toString();

    if (cleeng?.id) return cleeng?.id;
  },
}));
