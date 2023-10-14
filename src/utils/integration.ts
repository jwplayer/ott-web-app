import { INTEGRATION } from '#src/config';
import type { Config } from '#types/Config';

interface IntegrationInfo {
  integrationType: keyof typeof INTEGRATION | null;
  useSandbox?: boolean;
  clientId?: string;
  offers?: string[];
}
export default function getIntegration(integrations: Config['integrations']): IntegrationInfo {
  if (integrations?.cleeng?.id && integrations?.jwp?.clientId) {
    throw new Error('Invalid client integration. You cannot have both Cleeng and JWP integrations enabled at the same time.');
  }

  if (integrations?.jwp?.clientId) {
    return {
      integrationType: INTEGRATION.JWP,
      useSandbox: !!integrations.jwp.useSandbox,
      clientId: integrations.jwp.clientId,
      offers: integrations.jwp.assetId ? [`${integrations.jwp.assetId}`] : [],
    };
  }

  if (integrations?.cleeng?.id) {
    return {
      integrationType: INTEGRATION.CLEENG,
      useSandbox: !!integrations.cleeng.useSandbox,
      clientId: integrations.cleeng.id,
      offers: [integrations.cleeng?.monthlyOffer, integrations.cleeng?.yearlyOffer].filter((offer) => !!offer).map((offer) => `${offer}`),
    };
  }

  return {
    integrationType: null,
  };
}
