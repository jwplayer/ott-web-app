import { createStore } from './utils';

import type { AccessModel, Config } from '#types/Config';
import type { AdSchedule } from '#types/ad-schedule';
import { ACCESS_MODEL, INTEGRATION } from '#src/config';

export type IntegrationInfo = {
  integrationType: keyof typeof INTEGRATION | null;
  useSandbox: boolean;
  clientId?: string;
  offers: string[];
};

type ConfigState = {
  config: Config;
  accessModel: AccessModel;
  adScheduleData: AdSchedule | null | undefined;
  getIntegration: () => IntegrationInfo;
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
  getIntegration(): IntegrationInfo {
    const { cleeng, jwp } = get().config?.integrations;

    if (cleeng?.id && jwp?.clientId) {
      // Move to yup validation
      throw new Error('Invalid client integration. You cannot have both Cleeng and JWP integrations enabled at the same time.');
    }

    if (jwp?.clientId) {
      return {
        integrationType: INTEGRATION.JWP,
        useSandbox: !!jwp.useSandbox,
        clientId: jwp.clientId,
        offers: jwp.assetId ? [`${jwp.assetId}`] : [],
      };
    }

    if (cleeng?.id) {
      return {
        integrationType: INTEGRATION.CLEENG,
        useSandbox: !!cleeng.useSandbox,
        clientId: cleeng.id,
        offers: [cleeng?.monthlyOffer, cleeng?.yearlyOffer].filter(Boolean).map(String),
      };
    }

    return {
      useSandbox: true,
      offers: [],
      integrationType: null,
    };
  },
}));
