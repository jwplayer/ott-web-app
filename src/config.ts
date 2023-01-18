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

// OTT shared player
export const DEFAULT_PLAYER_ID: string = import.meta.env.APP_DEFAULT_PLAYER ?? 'M4qoGvUk';
