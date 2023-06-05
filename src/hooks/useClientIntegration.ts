import { useMemo } from 'react';

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
  const isCleeng = !!integrations.cleeng?.id;
  const sandbox = isJWP ? integrations.jwp?.useSandbox : integrations.cleeng?.useSandbox;
  const client = isJWP ? ClientIntegrations.JWP : ClientIntegrations.CLEENG;
  const clientId = isJWP ? integrations.jwp?.clientId : integrations.cleeng?.id;

  // prevent infinite updates when `clientOffers` is used in as dependency
  const clientOffers = useMemo(() => {
    if (isJWP && !!integrations.jwp?.assetId) {
      return [`${integrations.jwp.assetId}`];
    }

    if (isCleeng && integrations.cleeng?.monthlyOffer && integrations.cleeng?.yearlyOffer) {
      return [`${integrations.cleeng.monthlyOffer}`, `${integrations.cleeng.yearlyOffer}`];
    }

    // No offers or JWP/Cleeng TVOD
    return [];
  }, [isJWP, isCleeng, integrations.jwp, integrations.cleeng]);

  return {
    sandbox: sandbox ?? true,
    integration: integrations,
    client,
    clientId: clientId,
    clientOffers,
  };
};

export default useClientIntegration;
