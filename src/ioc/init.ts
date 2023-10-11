/* eslint-disable import/order */
// To organize imports in a better way

import { SERVICES, CONTROLLERS, IntegrationProvider, INTEGRATION_PROVIDER, IS_INITIALIZED } from './types';
import { iocContainer } from './container';

// Services
import ConfigService from '#src/services/config.service';
import EpgService from '#src/services/epg.service';
import AccountCleengService from '#src/services/cleeng.account.service';
import AccountJWService from '#src/services/inplayer.account.service';
import CheckoutCleengService from '#src/services/cleeng.checkout.service';
import CheckoutJWService from '#src/services/inplayer.checkout.service';
import SubscriptionJWService from '#src/services/jw.subscription.service';
import SubscriptionCleengService from '#src/services/cleeng.subscription.service';
import ProfileJWService from '#src/services/inplayer.profile.service';
import CleengService from '#src/services/cleeng.service';
import ApiService from '#src/services/api.service';
import EntitlementService from '#src/services/entitlement.service';
import WatchHistoryService from '#src/services/watchhistory.service';
import FavoritesService from '#src/services/favorites.service';

// Controllers
import WatchHistoryController from '#src/stores/WatchHistoryController';
import AccountController from '#src/stores/AccountController';
import ConfigController from '#src/stores/ConfigController';
import FavoritesController from '#src/stores/FavoritesController';
import SettingsController from '#src/stores/SettingsController';
import EpgController from '#src/stores/EpgController';
import ApiController from '#src/stores/ApiController';
import EntitlementController from '#src/stores/EntitlementController';
import CheckoutController from '#src/stores/CheckoutController';

const CLEENG_SERVICES = {
  [SERVICES.Cleeng]: CleengService,
  [SERVICES.Account]: AccountCleengService,
  [SERVICES.Checkout]: CheckoutCleengService,
  [SERVICES.Subscription]: SubscriptionCleengService,
} as const;

const JW_SERVICES = {
  [SERVICES.Account]: AccountJWService,
  [SERVICES.Checkout]: CheckoutJWService,
  [SERVICES.Subscription]: SubscriptionJWService,
  [SERVICES.Profile]: ProfileJWService,
} as const;

const COMMON_CONTROLLERS = {
  [CONTROLLERS.WatchHistory]: WatchHistoryController,
  [CONTROLLERS.Favorites]: FavoritesController,
  [CONTROLLERS.Epg]: EpgController,
  [CONTROLLERS.Entitlement]: EntitlementController,
} as const;

const bindServices = (servicesMap: { [x: symbol]: new (...args: any[]) => object }) => {
  Object.getOwnPropertySymbols(servicesMap).forEach((key) => iocContainer.bind(key).to(servicesMap[key]));
};

export const initIOCData = (integration: IntegrationProvider | null) => {
  if (!iocContainer.isBound(IS_INITIALIZED)) {
    iocContainer.bind(IS_INITIALIZED).toConstantValue(true);
  }

  if (integration === INTEGRATION_PROVIDER.CLEENG) {
    bindServices(CLEENG_SERVICES);
  }

  if (integration === INTEGRATION_PROVIDER.JW) {
    bindServices(JW_SERVICES);
  }

  if (integration) {
    iocContainer.bind<AccountController>(CONTROLLERS.Account).to(AccountController);
    iocContainer.bind<CheckoutController>(CONTROLLERS.Checkout).to(CheckoutController);
  }

  bindServices(COMMON_CONTROLLERS);
};

// Config injectables initialized by default
// No need to reconfigure them on the config change
export const initDefaultServices = () => {
  if (iocContainer.isBound(IS_INITIALIZED)) {
    return;
  }

  iocContainer.bind<ApiService>(SERVICES.Api).to(ApiService);
  iocContainer.bind<EpgService>(SERVICES.EPG).to(EpgService);
  iocContainer.bind<ConfigService>(SERVICES.Config).to(ConfigService);
  iocContainer.bind<EntitlementService>(SERVICES.Entitlement).to(EntitlementService);
  iocContainer.bind<FavoritesService>(SERVICES.Favorites).to(FavoritesService);
  iocContainer.bind<WatchHistoryService>(SERVICES.WatchHistory).to(WatchHistoryService);

  iocContainer.bind<ConfigController>(CONTROLLERS.Config).to(ConfigController);
  iocContainer.bind<SettingsController>(CONTROLLERS.Settings).to(SettingsController);
  iocContainer.bind<ApiController>(CONTROLLERS.Api).to(ApiController);
};
