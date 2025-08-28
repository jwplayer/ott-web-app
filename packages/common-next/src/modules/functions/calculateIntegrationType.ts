import type { CalculateIntegrationType } from '../../../types/calculate-integration-type';
import { INTEGRATION } from '../../constants';

export const isCleengIntegrationType: CalculateIntegrationType = (config) => {
  return config.integrations?.cleeng?.id ? INTEGRATION.CLEENG : null;
};

export const isJwpIntegrationType: CalculateIntegrationType = (config) => {
  return config.integrations?.jwp?.clientId ? INTEGRATION.JWP : null;
};
