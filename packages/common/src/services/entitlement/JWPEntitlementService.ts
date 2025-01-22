import { inject, injectable } from 'inversify';

import type { Config } from '../../../types/config';
import type { GetEntitledPlans } from '../../../types/checkout';
import type { PlansResponse } from '../../../types/plans';
import type { SignedMediaResponse } from '../integrations/jwp/types';
import JWPAPIService from '../integrations/jwp/JWPAPIService';
import EntitlementService from '../EntitlementService';

@injectable()
export default class JWPEntitlementService extends EntitlementService {
  protected readonly apiService;

  constructor(@inject(JWPAPIService) apiService: JWPAPIService) {
    super();
    this.apiService = apiService;
  }

  getMediaToken = async (config: Config, mediaId: string) => {
    if (!config.id) {
      throw new Error('ID missing from config');
    }

    try {
      const data = await this.apiService.get<SignedMediaResponse>(
        '/v2/items/jw-media/token',
        {
          withAuthentication: true,
        },
        {
          app_config_id: config.id,
          media_id: mediaId,
        },
      );

      return data.token;
    } catch {
      throw new Error('Unauthorized');
    }
  };

  getEntitledPlans: GetEntitledPlans = async ({ siteId }) => {
    try {
      const data = await this.apiService.get<PlansResponse>(`/v3/sites/${siteId}/entitlements`, {
        withAuthentication: await this.apiService.isAuthenticated(),
      });
      return data;
    } catch {
      throw new Error('Failed to fetch entitled plans');
    }
  };
}
