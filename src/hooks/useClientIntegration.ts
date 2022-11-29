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
  const clientName = isInPlayer ? ClientIntegrations.INPLAYER : ClientIntegrations.CLEENG;
  const clientId = isInPlayer ? integrations?.inplayer?.clientId : integrations?.cleeng?.id;

  // TODO: More data will follow. Example: access fees will be fetched and returned once user is auth.
  return {
    clientName,
    clientId,
  };
};

export default useClientIntegration;
