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

export const ADYEN_TEST_CLIENT_KEY = 'test_I4OFGUUCEVB5TI222AS3N2Y2LY6PJM3K';

export const ADYEN_LIVE_CLIENT_KEY = 'live_BQDOFBYTGZB3XKF62GBYSLPUJ4YW2TPL';

// how often the live channel schedule is refetched in ms
export const LIVE_CHANNELS_REFETCH_INTERVAL = 15 * 60_000;

// Some predefined media types of JW
export const MEDIA_CONTENT_TYPE = {
  // Series page with seasons / episodes
  series: 'series',
  // Separate episode page
  episode: 'episode',
  // Live channel (24x7)
  liveChannel: 'livechannel',
  // Temporary live stream that starts at a specific time
  liveEvent: 'liveevent',
  // Static page with markdown
  page: 'page',
  // Page with shelves list
  hub: 'hub',
} as const;

// Some predefined playlist types of JW
export const PLAYLIST_CONTENT_TYPE = {
  // Page with a list of live channels
  live: 'live',
} as const;

// Some predefined shelf types of JW
export const SHELF_LAYOUT_TYPE = {
  // Fullwidth hero, only available as the first shelf (index === 0)
  hero: 'hero',
  // Larger cards
  featured: 'featured',
  // By default: standard size cards (default)
} as const;

// OTT shared player
export const OTT_GLOBAL_PLAYER_ID = 'M4qoGvUk';

export const CONFIG_QUERY_KEY = 'app-config';

export const CONFIG_FILE_STORAGE_KEY = 'config-file-override';

export const CACHE_TIME = 60 * 1000 * 20; // 20 minutes

export const STALE_TIME = 60 * 1000 * 20;

export const CARD_ASPECT_RATIOS = ['1:1', '2:1', '2:3', '4:3', '5:3', '16:9', '9:13', '9:16'] as const;

export const MAX_WATCHLIST_ITEMS_COUNT = 48; // Default value

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
  hasNotifications: false,
  watchListSizeLimit: MAX_WATCHLIST_ITEMS_COUNT,
};

export const EPG_TYPE = {
  jwp: 'jwp',
  viewNexa: 'viewnexa',
} as const;

export const APP_CONFIG_ITEM_TYPE = {
  playlist: 'playlist',
  continue_watching: 'continue_watching',
  favorites: 'favorites',
  content_list: 'content_list',
  media: 'media',
} as const;

export const MANIFEST_TYPE = {
  dash: 'application/dash+xml"',
  hls: 'application/vnd.apple.mpegurl',
};
