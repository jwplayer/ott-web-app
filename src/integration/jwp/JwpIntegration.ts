import InPlayer, { AccountData, Env } from '@inplayer-org/inplayer.js';

import { Integration } from '#src/integration/integration';
import type { AccountDetails } from '#types/app';
import type { Config } from '#types/Config';
import { formatAccountDetails } from '#src/integration/jwp/formatters';
import type { InPlayerError } from '#types/inplayer';
import type { PlaylistItem } from '#types/playlist';
import * as favoritesService from '#src/services/favorites.service';
import * as watchHistoryService from '#src/services/watchHistory.service';
import type { EmailConfirmPasswordInput, FirstLastNameInput } from '#types/account';

enum InPlayerEnv {
  Development = 'development',
  Production = 'production',
  Daily = 'daily',
}

export class JwpIntegration extends Integration {
  clientId: string = '';

  account: AccountData | null = null;

  static IsSupported(config: Config) {
    return !!config.integrations.jwp?.clientId;
  }

  // feature flags should only be used to show/hide certain parts of the UI
  async getFeatures() {
    return {
      canUpdateEmail: false,
      canRenewSubscription: false,
      canChangePasswordWithOldPassword: true,
    };
  }

  async initialize(): Promise<AccountDetails | null> {
    if (!this.config.integrations.jwp) throw new Error('Failed to initialize JWP integration due to missing config');
    if (!this.config.integrations.jwp.clientId) throw new Error('Failed to initialize JWP integration due to missing `clientId`');

    const env: string = this.config.integrations.jwp.useSandbox ? InPlayerEnv.Development : InPlayerEnv.Production;

    InPlayer.setConfig(env as Env);

    this.clientId = this.config.integrations.jwp.clientId;

    // restore logic
    if (await this.isLoggedIn()) {
      return this.getCustomer();
    }

    return null;
  }

  async isLoggedIn() {
    return InPlayer.Account.isAuthenticated();
  }

  async login(email: string, password: string, _stayLoggedIn?: boolean): Promise<AccountDetails> {
    try {
      const { data } = await InPlayer.Account.signInV2({
        email,
        password,
        clientId: this.clientId,
        referrer: window.location.href,
      });

      // save account
      this.account = data.account;

      return formatAccountDetails(this.account);
    } catch {
      throw new Error('Failed to authenticate user.');
    }
  }

  async register(email: string, password: string): Promise<AccountDetails> {
    try {
      const { data } = await InPlayer.Account.signUpV2({
        email,
        password,
        passwordConfirmation: password,
        fullName: email,
        metadata: {
          first_name: ' ',
          surname: ' ',
        },
        type: 'consumer',
        clientId: this.clientId,
        referrer: window.location.href,
      });

      this.account = data.account;

      return formatAccountDetails(this.account);
    } catch (error: unknown) {
      // not TS friendly
      const { response } = error as InPlayerError;
      throw new Error(response.data.message);
    }
  }

  async getCustomer(): Promise<AccountDetails> {
    try {
      const { data } = await InPlayer.Account.getAccountInfo();

      this.account = data;

      return formatAccountDetails(data);
    } catch (error: unknown) {
      // not TS friendly
      const { response } = error as InPlayerError;
      throw new Error(response.data.message);
    }
  }

  async logout() {
    await InPlayer.Account.signOut();

    this.account = null;
  }

  async updateUserEmail (_formData: EmailConfirmPasswordInput): Promise<AccountDetails> {
    throw new Error('JWP doesn\'t support email update');
  }

  async updateUserProfile (formData: FirstLastNameInput): Promise<AccountDetails> {
    try {
      const { data } = await InPlayer.Account.updateAccount({
        fullName: this.account?.email || ' ',
        metadata: {
            first_name: formData.firstName,
            surname: formData.lastName,
        },
      });

      return formatAccountDetails(data);
    } catch {
      throw new Error('Failed to update user data.');
    }
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
