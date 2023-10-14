import { injectable } from 'inversify';

import EntitlementService from '#src/services/entitlement.service';
import type { GetMediaParams } from '#types/media';

@injectable()
export default class EntitlementController {
  private readonly entitlementService: EntitlementService;

  constructor(entitlementService: EntitlementService) {
    this.entitlementService = entitlementService;
  }

  async getMediaToken(host: string, id: string, jwt?: string, params?: GetMediaParams, drmPolicyId?: string) {
    return this.entitlementService.getMediaToken(host, id, jwt, params, drmPolicyId);
  }

  async getJWPMediaToken(configId: string = '', mediaId: string) {
    return this.entitlementService.getMediaToken(configId, mediaId);
  }
}
