import { useConfigStore } from '#src/stores/ConfigStore';

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

  return {
    integration: integrations,
    client,
    clientId: clientId,
  };
};

export default useClientIntegration;
