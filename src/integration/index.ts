import type { Config } from '#types/Config';
import type { Integration } from '#src/integration/integration';
import { CleengIntegration } from '#src/integration/cleeng/CleengIntegration';
import { JwpIntegration } from '#src/integration/jwp/JwpIntegration';

const supportedIntegrations = [CleengIntegration, JwpIntegration];

let currentIntegration: Integration | null = null;

export const createIntegration = async (config: Config) => {
  for (let i = 0; i < supportedIntegrations.length; i++) {
    if (supportedIntegrations[i].IsSupported(config)) {
      currentIntegration = new supportedIntegrations[i](config);
      break;
    }
  }

  return currentIntegration;
};

export const hasIntegration = () => !!currentIntegration;

export const getIntegration = () => currentIntegration;

export const withIntegration = async <T>(callback: (integration: Integration) => Promise<T> | T) => {
  if (!currentIntegration) throw new Error('Integration is not initialized');

  return callback(currentIntegration);
};

export const withOptionalIntegration = async (callback: (integration: Integration) => Promise<void> | void) => {
  if (currentIntegration) return callback(currentIntegration);
};
