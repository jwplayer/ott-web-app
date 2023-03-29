import { useConfigStore } from '#src/stores/ConfigStore';

export enum ClientIntegrations {
  JWP = 'jwplayer',
  CLEENG = 'cleeng',
}

const useClientIntegration = () => {
  const {
    config: { integrations },
  } = useConfigStore.getState();

  const isJWP = !!integrations.jwp?.clientId;
  const sandbox = isJWP ? integrations.jwp?.useSandbox : integrations.cleeng?.useSandbox;
  const client = isJWP ? ClientIntegrations.JWP : ClientIntegrations.CLEENG;
  const clientId = isJWP ? integrations.jwp?.clientId : integrations.cleeng?.id;
  const clientOffers = isJWP ? [`${integrations.jwp?.assetId}`] : [`${integrations.cleeng?.monthlyOffer}`, `${integrations.cleeng?.yearlyOffer}`];

  return {
    sandbox: sandbox ?? true,
    integration: integrations,
    client,
    clientId: clientId,
    clientOffers,
  };
};

export default useClientIntegration;
