export const VideoProgressMinMax = {
  Min: 0.05,
  Max: 0.95,
};

export const PLAYLIST_LIMIT = 25;

// 8 hours
export const SERIES_CACHE_TIME = 60 * 1000 * 60 * 8;

// The externalData attribute of Cleeng can contain max 5000 characters
export const MAX_WATCHLIST_ITEMS_COUNT = 48;

export const ADYEN_TEST_CLIENT_KEY = 'test_I4OFGUUCEVB5TI222AS3N2Y2LY6PJM3K';

export const ADYEN_LIVE_CLIENT_KEY = 'live_BQDOFBYTGZB3XKF62GBYSLPUJ4YW2TPL';

// how often the live channel schedule is refetched in ms
export const LIVE_CHANNELS_REFETCH_INTERVAL = 15 * 60_000;

// OTT shared player
export const OTT_GLOBAL_PLAYER_ID = 'M4qoGvUk';

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
