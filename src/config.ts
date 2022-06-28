// Use yarn start:dev-api to expose APP_API_ENV variable and use dev api host
export const API_BASE_URL = import.meta.env.APP_API_ENV === 'dev' ? 'https://content-portal.jwplatform.com' : 'https://content.jwplatform.com';

export const VideoProgressMinMax = {
  Min: 0.05,
  Max: 0.95,
};

export const PLAYLIST_LIMIT = 25;

export const ADYEN_TEST_CLIENT_KEY = 'test_I4OFGUUCEVB5TI222AS3N2Y2LY6PJM3K';

export const ADYEN_LIVE_CLIENT_KEY = 'live_BQDOFBYTGZB3XKF62GBYSLPUJ4YW2TPL';
