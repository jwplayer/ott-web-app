export enum PersonalShelf {
  ContinueWatching = 'continue_watching',
  Favorites = 'favorites',
}

export const PersonalShelves = [PersonalShelf.Favorites, PersonalShelf.ContinueWatching];

export const INTEGRATION = {
  JWP: 'JWP',
  CLEENG: 'CLEENG',
} as const;

export const ACCESS_MODEL = {
  AVOD: 'AVOD',
  AUTHVOD: 'AUTHVOD',
  SVOD: 'SVOD',
} as const;

export const VideoProgressMinMax = {
  Min: 0.05,
  Max: 0.95,
};

export const PLAYLIST_LIMIT = 25;

// The externalData attribute of Cleeng can contain max 5000 characters
export const MAX_WATCHLIST_ITEMS_COUNT = 48;

export const ADYEN_TEST_CLIENT_KEY = 'test_I4OFGUUCEVB5TI222AS3N2Y2LY6PJM3K';

export const ADYEN_LIVE_CLIENT_KEY = 'live_BQDOFBYTGZB3XKF62GBYSLPUJ4YW2TPL';

// how often the live channel schedule is refetched in ms
export const LIVE_CHANNELS_REFETCH_INTERVAL = 15 * 60_000;

// Some predefined types of JW
export const CONTENT_TYPE = {
  // Series page with seasons / episodes
  series: 'series',
  // Separate episode page
  episode: 'episode',
  // Page with a list of channels
  live: 'live',
  // Separate channel page
  livechannel: 'livechannel',
  // Static page with markdown
  page: 'page',
  // Page with shelves list
  hub: 'hub',
} as const;

// OTT shared player
export const OTT_GLOBAL_PLAYER_ID = 'M4qoGvUk';

export const CONFIG_QUERY_KEY = 'app-config';

export const CONFIG_FILE_STORAGE_KEY = 'config-file-override';

export const CACHE_TIME = 60 * 1000 * 20; // 20 minutes

export const STALE_TIME = 60 * 1000 * 20;

export const DEFAULT_FEATURES = {
  canUpdateEmail: false,
  canSupportEmptyFullName: false,
  canChangePasswordWithOldPassword: false,
  canRenewSubscription: false,
  canExportAccountData: false,
  canDeleteAccount: false,
  canUpdatePaymentMethod: false,
  canShowReceipts: false,
  hasSocialURLs: false,
  hasProfiles: false,
  hasNotifications: false,
};
