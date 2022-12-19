import { useConfigStore } from '#src/stores/ConfigStore';
import * as InPlayerCheckoutService from '#src/services/inplayer.checkout.service';
import * as CleengCheckoutService from '#src/services/cleeng.checkout.service';

export enum ClientIntegrations {
  INPLAYER = 'inplayer',
  CLEENG = 'cleeng',
}

const useClientIntegration = () => {
  const {
    config: { integrations },
  } = useConfigStore.getState();

  const isInPlayer = !!integrations?.inplayer?.clientId;
  const client = isInPlayer ? ClientIntegrations.INPLAYER : ClientIntegrations.CLEENG;
  const clientId = isInPlayer ? integrations?.inplayer?.clientId : integrations?.cleeng?.id;
  const checkoutService = isInPlayer ? InPlayerCheckoutService : CleengCheckoutService;

  return {
    integration: integrations,
    client,
    clientId: clientId,
    checkoutService,
  };
};

export default useClientIntegration;
