import { inject, injectable } from 'inversify';

import { SERVICES } from '#src/ioc/types';
import type EntitlementService from '#src/services/entitlement.service';
import type { GetMediaParams } from '#types/media';

@injectable()
export default class EntitlementController {
  private entitlementService: EntitlementService;

  constructor(@inject(SERVICES.Entitlement) entitlementService: EntitlementService) {
    this.entitlementService = entitlementService;
  }

  async getMediaToken(host: string, id: string, jwt?: string, params?: GetMediaParams, drmPolicyId?: string) {
    return this.entitlementService.getMediaToken(host, id, jwt, params, drmPolicyId);
  }

  async getJWPMediaToken(configId: string = '', mediaId: string) {
    return this.entitlementService.getMediaToken(configId, mediaId);
  }
}
