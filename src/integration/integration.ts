import type { Config } from '#types/Config';
import type { AccountDetails } from '#types/app';
import type { SerializedFavorite } from '#types/favorite';
import type { SerializedWatchHistoryItem } from '#types/watchHistory';
import type { PlaylistItem } from '#types/playlist';
import type { EmailConfirmPasswordInput, FirstLastNameInput } from '#types/account';

type IntegrationFeatures = {
  canUpdateEmail: boolean;
  canRenewSubscription: boolean;
  canChangePasswordWithOldPassword: boolean;
};

export abstract class Integration {
  static IsSupported(_config: Config) {
    return false;
  }

  config: Config;

  constructor (config: Config) {
    this.config = config;
  }

  abstract initialize (): Promise<AccountDetails | null>;

  abstract getFeatures (): Promise<IntegrationFeatures>;

  // Account

  abstract isLoggedIn (): Promise<boolean>;

  abstract getCustomer (): Promise<AccountDetails>;

  abstract login (email: string, password: string, stayLoggedIn?: boolean): Promise<AccountDetails>;

  abstract logout (): Promise<void>;

  abstract register (email: string, password: string): Promise<AccountDetails>;

  abstract updateUserProfile (formData : FirstLastNameInput): Promise<AccountDetails>;

  abstract updateUserEmail (formData : EmailConfirmPasswordInput): Promise<AccountDetails>;

  // Personal Shelves

  abstract getFavorites (): Promise<SerializedFavorite[]>;

  abstract saveFavorite (item: PlaylistItem): Promise<SerializedFavorite[]>;

  abstract removeFavorite (item: PlaylistItem): Promise<SerializedFavorite[]>;

  abstract clearFavorites (): Promise<void>;

  abstract getWatchHistory (): Promise<SerializedWatchHistoryItem[]>;

  abstract saveWatchHistory (item: PlaylistItem, progress: number): Promise<SerializedWatchHistoryItem[]>;

  abstract removeWatchHistory (item: PlaylistItem): Promise<SerializedWatchHistoryItem[]>;

  abstract clearWatchHistory (): Promise<void>;

}

