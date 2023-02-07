import { useConfigStore } from '#src/stores/ConfigStore';

export enum ClientIntegrations {
  JWP = 'jwplayer',
  CLEENG = 'cleeng',
}

const useClientIntegration = () => {
  const {
    config: { integrations },
  } = useConfigStore.getState();

  const isJWP = !!integrations.jwp?.clientId || !!integrations.inplayer?.clientId;
  const jwpIntegration = integrations.jwp?.clientId ? integrations.jwp : integrations.inplayer;
  const sandbox = isJWP ? jwpIntegration?.useSandbox : integrations.cleeng?.useSandbox;
  const client = isJWP ? ClientIntegrations.JWP : ClientIntegrations.CLEENG;
  const clientId = isJWP ? jwpIntegration?.clientId : integrations.cleeng?.id;
  const clientOffers = isJWP ? [`${jwpIntegration?.assetId}`] : [`${integrations.cleeng?.monthlyOffer}`, `${integrations.cleeng?.yearlyOffer}`];

  return {
    sandbox: sandbox ?? true,
    integration: integrations,
    client,
    clientId: clientId,
    clientOffers,
  };
};

export default useClientIntegration;
