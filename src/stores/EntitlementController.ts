import { injectable } from 'inversify';

import EntitlementService from '#src/services/entitlement.service';
import type { GetMediaParams } from '#types/media';

@injectable()
export default class EntitlementController {
  private readonly entitlementService: EntitlementService;

  constructor(entitlementService: EntitlementService) {
    this.entitlementService = entitlementService;
  }

  getMediaToken = async (host: string, id: string, jwt?: string, params?: GetMediaParams, drmPolicyId?: string) => {
    return this.entitlementService.getMediaToken(host, id, jwt, params, drmPolicyId);
  };

  getJWPMediaToken = async (configId: string = '', mediaId: string) => {
    return this.entitlementService.getMediaToken(configId, mediaId);
  };
}
