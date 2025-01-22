import { inject, injectable } from 'inversify';

import type { IntegrationType } from '../../types/config';
import type { AccessTokens } from '../../types/access';
import ApiService from '../services/ApiService';
import AccessService from '../services/AccessService';
import AccountService from '../services/integrations/AccountService';
import StorageService from '../services/StorageService';
import { useConfigStore } from '../stores/ConfigStore';
import { INTEGRATION_TYPE } from '../modules/types';
import { getNamedModule } from '../modules/container';
import { useAccountStore } from '../stores/AccountStore';
import { ApiError } from '../utils/api';
import { useAccessStore } from '../stores/AccessStore';

const ACCESS_TOKENS = 'access_tokens';

@injectable()
export default class AccessController {
  private readonly apiService: ApiService;
  private readonly accessService: AccessService;
  private readonly accountService?: AccountService;
  private readonly storageService: StorageService;

  private siteId: string = '';

  constructor(
    @inject(INTEGRATION_TYPE) integrationType: IntegrationType,
    @inject(ApiService) apiService: ApiService,
    @inject(StorageService) storageService: StorageService,
    @inject(AccessService) accessService: AccessService,
  ) {
    this.apiService = apiService;
    this.accessService = accessService;
    this.storageService = storageService;
    this.accountService = getNamedModule(AccountService, integrationType, false);
  }

  initialize = async () => {
    const { config, accessModel } = useConfigStore.getState();
    this.siteId = config.siteId;

    // For the AVOD access model, signing and DRM are not supported, so access tokens generation is skipped
    if (accessModel === 'AVOD') {
      return;
    }

    // Not awaiting to avoid blocking the loading process,
    // as the initial access tokens can be stored asynchronously without affecting the app's performance
    void this.generateOrRefreshAccessTokens();
  };

  /**
   * Retrieves media by its ID using a passport token.
   * If no access tokens exist, it attempts to generate them, if the passport token is expired, it attempts to refresh them.
   * If an access token retrieval fails or the user is not entitled to the content, an error is thrown.
   */
  getMediaById = async (mediaId: string, language?: string) => {
    const { entitledPlan } = useAccountStore.getState();

    if (!this.siteId || !entitledPlan) {
      return;
    }

    try {
      const accessTokens = await this.generateOrRefreshAccessTokens();
      if (!accessTokens?.passport) {
        throw new Error('Failed to get / generate access tokens and retrieve media.');
      }
      return await this.apiService.getMediaByIdWithPassport({
        id: mediaId,
        siteId: this.siteId,
        planId: entitledPlan.id,
        passport: accessTokens.passport,
        language,
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.code === 403) {
        // If the passport is invalid or expired, refresh the access tokens and try to get the media again.
        const accessTokens = await this.refreshAccessTokens();
        if (accessTokens?.passport) {
          return await this.apiService.getMediaByIdWithPassport({
            id: mediaId,
            siteId: this.siteId,
            planId: entitledPlan.id,
            passport: accessTokens.passport,
            language,
          });
        }

        throw new Error('Failed to refresh access tokens and retrieve media.');
      }
      throw error;
    }
  };

  /**
   * Generates or refreshes access tokens based on their current validity.
   * If existing tokens are expired, they are refreshed; if no tokens exist, they are generated.
   * If the existing tokens are valid, it retrieves them.
   */
  generateOrRefreshAccessTokens = async (): Promise<AccessTokens | null> => {
    const existingAccessTokens = await this.getAccessTokens();
    const shouldRefresh = existingAccessTokens && Date.now() > existingAccessTokens.expires;

    if (!existingAccessTokens) {
      await this.generateAccessTokens();
    }

    if (shouldRefresh) {
      return await this.refreshAccessTokens();
    }

    return existingAccessTokens;
  };

  /**
   * Generates access tokens based on the viewer auth data.
   * If the viewer is not authenticated it generates only access for free plans (if they are defined).
   * Stores the access tokens in local storage.
   */
  generateAccessTokens = async (): Promise<AccessTokens | null> => {
    if (!this.siteId) {
      return null;
    }

    const auth = await this.accountService?.getAuthData();

    const accessTokens = await this.accessService.generateAccessTokens(this.siteId, auth?.jwt);
    if (accessTokens) {
      await this.setAccessTokens(accessTokens);
      return accessTokens;
    }

    return null;
  };

  /**
   * Refreshes the access tokens using the refresh token if they exist.
   * If no tokens are found, it cannot refresh and returns null.
   * Updates the localstorage with the newly generated access tokens.
   */
  refreshAccessTokens = async (): Promise<AccessTokens | null> => {
    const existingAccessTokens = await this.getAccessTokens();
    // there is no access tokens stored, nothing to refresh
    if (!existingAccessTokens) {
      return null;
    }

    const accessTokens = await this.accessService.refreshAccessTokens(this.siteId, existingAccessTokens.refresh_token);
    if (accessTokens) {
      await this.setAccessTokens(accessTokens);
      return accessTokens;
    }

    return null;
  };

  /**
   * Stores the access tokens in local storage, adding an expiration timestamp of 1 hour (passport validity).
   * The expiration timestamp helps determine when the passport token should be refreshed.
   */
  setAccessTokens = async (accessTokens: AccessTokens) => {
    useAccessStore.setState({ passport: accessTokens.passport });
    // Since the actual valid time for a passport token is 1 hour, set the expires to one hour from now.
    // The expires field here is used as a helper to manage the passport's validity and refresh process.
    const expires = new Date(Date.now() + 3600 * 1000).getTime();
    return await this.storageService.setItem(ACCESS_TOKENS, JSON.stringify({ ...accessTokens, expires }), true);
  };

  /**
   * Retrieves the access tokens from local storage (if any) along with their expiration timestamp.
   */
  getAccessTokens = async (): Promise<(AccessTokens & { expires: number }) | null> => {
    const accessTokens = await this.storageService.getItem<
      AccessTokens & {
        expires: number;
      }
    >(ACCESS_TOKENS, true, true);
    if (accessTokens) {
      useAccessStore.setState({ passport: accessTokens.passport });
    }

    return accessTokens;
  };

  /**
   * Removes the access tokens from local storage (if any).
   */
  removeAccessTokens = async () => {
    useAccessStore.setState({ passport: null });
    return await this.storageService.removeItem(ACCESS_TOKENS);
  };
}
