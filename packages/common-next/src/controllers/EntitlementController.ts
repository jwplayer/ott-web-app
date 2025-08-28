import { inject, injectable } from 'inversify';

import { useConfigStore } from '../stores/ConfigStore';
import type { GetMediaParams } from '../../types/media';
import { getModule } from '../modules/container';
import GenericEntitlementService from '../services/entitlement/GenericEntitlementService';
import ApiService from '../services/ApiService';
import JWPEntitlementService from '../services/entitlement/JWPEntitlementService';
import type { PlaylistItem } from '../../types/playlist';
import type EntitlementService from '../services/EntitlementService';
import { isTruthyCustomParamValue } from '../utils/common';

import AccountController from './AccountController';
import AccessController from './AccessController';

@injectable()
export default class EntitlementController {
  private accountController: AccountController;
  private accessController: AccessController;
  private apiService: ApiService;

  constructor(
    @inject(AccountController) accountController: AccountController,
    @inject(AccessController) accessController: AccessController,
    @inject(ApiService) apiService: ApiService,
  ) {
    this.accountController = accountController;
    this.accessController = accessController;
    this.apiService = apiService;
  }

  protected validateGeoRestriction = async (media?: PlaylistItem) => {
    const m3u8 = media?.sources.find((source) => source.file.indexOf('.m3u8') !== -1);

    if (m3u8) {
      const response = await fetch(m3u8.file, { method: 'HEAD' });
      if (response.status === 403) {
        throw new Error('access blocked');
      }
    }
  };

  protected getEntitlementService = (): EntitlementService | undefined => {
    const {
      config: {
        custom,
        contentProtection,
        integrations: { jwp },
      },
    } = useConfigStore.getState();
    const host = typeof custom?.entitlementHost === 'string' ? custom.entitlementHost : undefined;
    const drmPolicyId = contentProtection?.drm?.defaultPolicyId || custom?.drmPolicyId;
    const urlSigning = isTruthyCustomParamValue(custom?.urlSigning);

    // generic entitlement service is enabled when a host is set and `custom.urlSigning`
    if (host && urlSigning) {
      const service = getModule(GenericEntitlementService);
      service.setHost(host);
      return service;
    }

    // JWP entitlement provider, automatically enable when DRM is enabled or when `custom.urlSigning` is enabled
    if (jwp && (!!drmPolicyId || urlSigning)) {
      return getModule(JWPEntitlementService);
    }
  };

  getSignedMedia = async (id: string, language?: string, params?: GetMediaParams, isPublic?: boolean) => {
    const { config, settings, accessModel } = useConfigStore.getState();
    const { custom, contentProtection } = config;

    const isAccessBridgeEnabled = !!settings?.apiAccessBridgeUrl;
    const drmPolicyId = contentProtection?.drm?.defaultPolicyId ?? (custom?.drmPolicyId as string | undefined);
    const accessType = isPublic ? 'public' : accessModel.toLowerCase(); // Can be: public | avod | authvod | svod

    let signedMediaItem;

    // signing is handled by access bridge
    if (isAccessBridgeEnabled) {
      signedMediaItem = await this.accessController.getMediaById(id, language);
    } else {
      const authData = await this.accountController.getAuthData();
      const entitlementService = this.getEntitlementService();
      const token = await entitlementService?.getMediaToken(config, id, authData?.jwt, params, drmPolicyId, accessType);

      signedMediaItem = await this.apiService.getMediaById({ id, token, drmPolicyId, language });
    }

    await this.validateGeoRestriction(signedMediaItem);

    return signedMediaItem;
  };
}
