import jwtDecode from 'jwt-decode';

import * as client from '#src/integration/cleeng/client';
import * as favoritesService from '#src/services/favorites.service';
import * as watchHistoryService from '#src/services/watchHistory.service';
import type { AccountDetails } from '#types/app';
import type { Config } from '#types/Config';
import type { AuthData, EmailConfirmPasswordInput, FirstLastNameInput, JwtDetails, LocalesData } from '#types/account';
import type { Customer } from '#types/cleeng';
import { Integration } from '#src/integration/integration';
import { formatAccountDetails } from '#src/integration/cleeng/formatters';
import type { PlaylistItem } from '#types/playlist';
import * as persist from '#src/utils/persist';
import { logDev } from '#src/utils/common';

const PERSIST_KEY_ACCOUNT = 'auth';

export class CleengIntegration extends Integration {

  sandbox: boolean = false;
  publisherId: string = '';

  locales: LocalesData | null = null;
  authData: AuthData | null = null;
  customer: Customer | null = null;

  static IsSupported(config: Config) {
    return !!config.integrations.cleeng?.id;
  }

  async isLoggedIn() {
    return !!this.authData;
  }

  async getFeatures() {
    return {
      canUpdateEmail: true,
      canRenewSubscription: true,
      canChangePasswordWithOldPassword: false,
    };
  }

  async initialize() {
    this.sandbox = !!this.config.integrations.cleeng?.useSandbox;
    this.publisherId = this.config.integrations.cleeng?.id || '';

    this.locales = await client.getLocales({ sandbox: this.sandbox });

    const storedAuthData: AuthData | null = persist.getItem(PERSIST_KEY_ACCOUNT) as AuthData | null;

    try {
      if (storedAuthData) {
        this.authData = storedAuthData;

        // try getting a new access token
        await this.refreshAccessToken();

        // get customer information
        await this.getCustomer();
      }
    } catch (error: unknown) {
      logDev('Error while restoring Cleeng session', error);
      this.authData = null;
    }

    return this.customer ? formatAccountDetails(this.customer) : null;
  }

  async login(email: string, password: string, _stayLoggedIn?: boolean): Promise<AccountDetails> {
    this.authData = await client.login({
      publisherId: this.publisherId,
      sandbox: this.sandbox,
      email,
      password,
    });

    persist.setItem(PERSIST_KEY_ACCOUNT, this.authData);

    return this.getCustomer();
  }

  async register(email: string, password: string): Promise<AccountDetails> {
    if (!this.locales) throw new Error('Locale data is missing');

    this.authData = await client.register({
      publisherId: this.publisherId,
      sandbox: this.sandbox,
      locale: this.locales.locale,
      currency: this.locales.currency,
      country: this.locales.country,
      email,
      password,
    });

    persist.setItem(PERSIST_KEY_ACCOUNT, this.authData);

    return this.getCustomer();
  }

  async refreshAccessToken() {
    if (!this.authData) throw new Error('User not logged in');

    const { data: { responseData } } = await client.refreshToken({ sandbox: this.sandbox, refreshToken: this.authData.refreshToken })

    this.authData = responseData;

    persist.setItem(PERSIST_KEY_ACCOUNT, this.authData);
  }

  async getCustomer() {
    if (!this.authData) throw new Error('User not signed in');

    const decodedToken: JwtDetails = jwtDecode(this.authData.jwt);
    const customerId = decodedToken.customerId;

    this.customer = await client.getCustomer({
      publisherId: this.publisherId,
      sandbox: this.sandbox,
      jwt: this.authData.jwt,
      customerId,
    });

    return formatAccountDetails(this.customer);
  }

  async logout() {
    this.authData = null;
    this.customer = null;
  }

  async updateUserEmail (formData: EmailConfirmPasswordInput): Promise<AccountDetails> {
    if (!this.customer || !this.authData) throw new Error('Not logged in');

    const updatedCustomer = await client.updateCustomer({
      sandbox: this.sandbox,
      publisherId: this.publisherId,
      jwt: this.authData.jwt,
      customerId: this.customer.id,
      payload: {
        id: this.customer.id, // JWP specific??
        ...formData,
      },
    });

    return formatAccountDetails(updatedCustomer);
  }

  async updateUserProfile (formData: FirstLastNameInput): Promise<AccountDetails> {
    if (!this.customer || !this.authData) throw new Error('Not logged in');

    const updatedCustomer = await client.updateCustomer({
      sandbox: this.sandbox,
      publisherId: this.publisherId,
      jwt: this.authData.jwt,
      customerId: this.customer.id,
      payload: {
        id: this.customer.id, // JWP specific??
        ...formData,
      },
    });

    return formatAccountDetails(updatedCustomer);
  }

  // Personal Shelves

  async saveFavorite(item: PlaylistItem) {
    const isLoggedIn = await this.isLoggedIn();

    if (isLoggedIn) {
      // store in account
    }

    return await favoritesService.saveFavorite(item);
  }

  async removeFavorite(item: PlaylistItem) {
    const isLoggedIn = await this.isLoggedIn();

    if (isLoggedIn) {
      // remove from account
    }

    return await favoritesService.removeFavorite(item);
  }

  async getFavorites() {
    const isLoggedIn = await this.isLoggedIn();

    if (isLoggedIn) {
      // get from account
    }

    return await favoritesService.getFavorites();
  }

  async clearFavorites() {
    const isLoggedIn = await this.isLoggedIn();

    if (isLoggedIn) {
      // get from account
    }

    await favoritesService.clearFavorites();
  }

  async saveWatchHistory(item: PlaylistItem, progress: number) {
    const isLoggedIn = await this.isLoggedIn();

    if (isLoggedIn) {
      // store in account
    }

    return await watchHistoryService.saveWatchHistory(item, progress);
  }

  async removeWatchHistory(item: PlaylistItem) {
    const isLoggedIn = await this.isLoggedIn();

    if (isLoggedIn) {
      // remove from account
    }

    return await watchHistoryService.removeWatchHistory(item);
  }

  async getWatchHistory() {
    const isLoggedIn = await this.isLoggedIn();

    if (isLoggedIn) {
      // get from account
    }

    return await watchHistoryService.getWatchHistory();
  }

  async clearWatchHistory() {
    const isLoggedIn = await this.isLoggedIn();

    if (isLoggedIn) {
      // get from account
    }

    await watchHistoryService.clearWatchHistory();
  }

}
