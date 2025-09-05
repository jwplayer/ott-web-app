import type { ResolutionContext } from 'inversify';

import AppController from '../../controllers/AppController';

/**
 * This function is used to get the integration type from the AppController and is mainly used for getting named
 * modules from the container registry.
 */
export const getIntegrationType = (context: ResolutionContext) => {
  return context.get(AppController).getIntegrationType();
};
