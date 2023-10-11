export const SERVICES = {
  Account: Symbol.for('AccountService'),
  Api: Symbol.for('ApiService'),
  Checkout: Symbol.for('CheckoutService'),
  Cleeng: Symbol.for('CleengService'),
  Config: Symbol.for('ConfigService'),
  Entitlement: Symbol.for('EntitlementService'),
  EPG: Symbol.for('EPGService'),
  Favorites: Symbol.for('FavoritesService'),
  Subscription: Symbol.for('SubscriptionService'),
  WatchHistory: Symbol.for('WatchHistoryService'),
  Profile: Symbol.for('ProfileService'),
};

export const CONTROLLERS = {
  Account: Symbol.for('AccountController'),
  Api: Symbol.for('ApiController'),
  Checkout: Symbol.for('CheckoutController'),
  Config: Symbol.for('ConfigController'),
  Entitlement: Symbol.for('EntitlementController'),
  Favorites: Symbol.for('FavoritesController'),
  Settings: Symbol.for('SettingsController'),
  WatchHistory: Symbol.for('WatchHistoryController'),
  Epg: Symbol.for('EpgController'),
  Profile: Symbol.for('ProfileController'),
};

export const INTEGRATION_PROVIDER = {
  JW: 'JW',
  CLEENG: 'CLEENG',
} as const;

export const IS_INITIALIZED = 'IS_INITIALIZED';

export type ControllerType = keyof typeof CONTROLLERS;

export type IntegrationProvider = keyof typeof INTEGRATION_PROVIDER;
