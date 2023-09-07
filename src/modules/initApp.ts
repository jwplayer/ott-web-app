import AccountController from '#src/controllers/AccountController';
import { loadAndValidateConfig } from '#src/utils/configLoad';
import FavoritesController from '#src/controllers/FavoritesController';
import { PersonalShelf } from '#src/config';
import { container } from '#src/modules/container';
import ApiService from '#src/services/api.service';
import ApiController from '#src/controllers/ApiController';
import WatchHistoryService from '#src/services/WatchHistoryService';
import WatchHistoryController from '#src/controllers/WatchHistoryController';
import getIntegration, { IntegrationType } from '#src/utils/getIntegration';
import CleengService from '#src/services/cleeng.service';
import AccountService from '#src/services/account.service';
import CleengAccountService from '#src/services/cleeng.account.service';
import CheckoutService from '#src/services/checkout.service';
import CleengCheckoutService from '#src/services/cleeng.checkout.service';
import SubscriptionService from '#src/services/subscription.service';
import CleengSubscriptionService from '#src/services/cleeng.subscription.service';
import InplayerAccountService from '#src/services/inplayer.account.service';
import InplayerCheckoutService from '#src/services/inplayer.checkout.service';
import SubscriptionJWService from '#src/services/inplayer.subscription.service';
import CheckoutController from '#src/controllers/CheckoutController';
import EpgService from '#src/services/epg.service';
import EntitlementService from '#src/services/entitlement.service';
import FavoritesService from '#src/services/FavoritesService';
import EpgController from '#src/controllers/EpgController';
import EntitlementController from '#src/controllers/EntitlementController';

export const initApp = async (configSource: string | undefined) => {
  const config = await loadAndValidateConfig(configSource);
  const { integrationType } = getIntegration(config.integrations);

  container.unbindAll();

  // Common services
  container.bind(ApiService).toSelf();
  container.bind(EpgService).toSelf();

  // Common controllers
  container.bind(ApiController).toSelf();
  container.bind(EpgController).toSelf();

  if (integrationType === IntegrationType.CLEENG) {
    container.bind(CleengService).toSelf();
    container.bind(AccountService).to(CleengAccountService);
    container.bind(CheckoutService).to(CleengCheckoutService);
    container.bind(SubscriptionService).to(CleengSubscriptionService);
  }

  if (integrationType === IntegrationType.JWP) {
    container.bind(AccountService).to(InplayerAccountService);
    container.bind(CheckoutService).to(InplayerCheckoutService);
    container.bind(SubscriptionService).to(SubscriptionJWService);
  }

  // We only request favorites and continue_watching data if there is a corresponding item in the content section
  // and a playlist in the features section.
  // We first initialize the account otherwise if we have favorites saved as externalData and in a local storage the sections may blink
  if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
    container.bind(WatchHistoryService).toSelf();
    container.bind(WatchHistoryController).toSelf();

    await container.resolve(WatchHistoryController).restoreWatchHistory();
  }

  if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
    container.bind(FavoritesService).toSelf();
    container.bind(FavoritesController).toSelf();

    await container.resolve(FavoritesController).initializeFavorites();
  }

  if (integrationType) {
    container.bind(AccountController).toSelf();
    container.bind(CheckoutController).toSelf();
    container.bind(EntitlementController).toSelf();
    container.bind(EntitlementService).toSelf();

    await container.resolve(AccountController).initializeAccount();
  }

  return config;
};
