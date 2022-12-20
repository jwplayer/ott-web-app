import { useConfigStore } from '#src/stores/ConfigStore';

export enum ClientIntegrations {
  INPLAYER = 'inplayer',
  CLEENG = 'cleeng',
}

const useClientIntegration = () => {
  const {
    config: { integrations },
  } = useConfigStore.getState();

  const isInPlayer = !!integrations.inplayer?.clientId;
  const sandbox = isInPlayer ? integrations.inplayer?.useSandbox : integrations.cleeng?.useSandbox;
  const client = isInPlayer ? ClientIntegrations.INPLAYER : ClientIntegrations.CLEENG;
  const clientId = isInPlayer ? integrations.inplayer?.clientId : integrations.cleeng?.id;
  const clientOffers = isInPlayer ? [`${integrations.inplayer?.assetId}`] : [`${integrations.cleeng?.monthlyOffer}`, `${integrations.cleeng?.yearlyOffer}`];

  return {
    sandbox: sandbox ?? true,
    integration: integrations,
    client,
    clientId: clientId,
    clientOffers,
  };
};

export default useClientIntegration;
