import { useMemo } from 'react';

import { useConfigStore } from '#src/stores/ConfigStore';
import getIntegration from '#src/utils/getIntegration';

const useClientIntegration = () => {
  const {
    config: { integrations },
  } = useConfigStore.getState();

  const { integrationType, useSandbox, clientId, offers } = useMemo(() => getIntegration(integrations), [integrations]);

  return {
    sandbox: useSandbox ?? true,
    integration: integrations,
    client: integrationType,
    clientId: clientId,
    clientOffers: offers || [],
  };
};

export default useClientIntegration;
