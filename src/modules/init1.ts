/* eslint-disable import/order */
// To organize imports in a better way
import ApiService from '#src/services/api.service';
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
import WatchHistoryService from '#src/services/watchhistory.service';
import ProfileService from '#src/services/profile.service';
import InplayerProfileService from '#src/services/inplayer.profile.service';
import EpgService from '#src/services/epg.service';
import EntitlementService from '#src/services/entitlement.service';
import FavoritesService from '#src/services/favorites.service';
import ConfigService from '#src/services/config.service';
import CleengProfileService from '#src/services/cleeng.profile.service';

import ApiController from '#src/stores/ApiController';
import WatchHistoryController from '#src/stores/WatchHistoryController';
import CheckoutController from '#src/stores/CheckoutController';
import AccountController from '#src/stores/AccountController';
import EpgController from '#src/stores/EpgController';
import EntitlementController from '#src/stores/EntitlementController';
import ProfileController from '#src/stores/ProfileController';
import FavoritesController from '#src/stores/FavoritesController';
import AppController from '#src/stores/AppController1';

import { PersonalShelf, INTEGRATION } from '#src/config';

import { container, getModule } from './container';

const resolveResources = async () => {
  container.bind(ConfigService).toSelf();
  container.bind(AppController).toSelf();
  container.bind(ApiService).toSelf();

  const appController = getModule(AppController);
  const data = await appController.loadResources();
  const { integrationType } = appController.getIntegration();

  return { ...data, integrationType };
};

export const initApp = async () => {
  container.unbindAll();

  const { config, configSource, settings, integrationType } = await resolveResources();

  // Common services
  container.bind(EpgService).toSelf();
  container.bind(WatchHistoryService).toSelf();
  container.bind(FavoritesService).toSelf();
  container.bind(EntitlementService).toSelf();

  // Common controllers
  container.bind(ApiController).toSelf();
  container.bind(EpgController).toSelf();
  container.bind(WatchHistoryController).toSelf();
  container.bind(FavoritesController).toSelf();
  container.bind(EntitlementController).toSelf();

  if (integrationType === INTEGRATION.CLEENG) {
    container.bind(CleengService).toSelf();
    container.bind(AccountService).to(CleengAccountService);
    container.bind(CheckoutService).to(CleengCheckoutService);
    container.bind(SubscriptionService).to(CleengSubscriptionService);
    container.bind(ProfileService).to(CleengProfileService);
  }

  if (integrationType === INTEGRATION.JWP) {
    container.bind(AccountService).to(InplayerAccountService);
    container.bind(CheckoutService).to(InplayerCheckoutService);
    container.bind(SubscriptionService).to(SubscriptionJWService);
    container.bind(ProfileService).to(InplayerProfileService);
  }

  // We only request favorites and continue_watching data if there is a corresponding item in the content section
  // and a playlist in the features section.
  // We first initialize the account otherwise if we have favorites saved as externalData and in a local storage the sections may blink
  if (config.features?.continueWatchingList && config.content.some((el) => el.type === PersonalShelf.ContinueWatching)) {
    await container.resolve(WatchHistoryController).restoreWatchHistory();
  }

  if (config.features?.favoritesList && config.content.some((el) => el.type === PersonalShelf.Favorites)) {
    await container.resolve(FavoritesController).initializeFavorites();
  }

  if (integrationType) {
    container.bind(AccountController).toSelf();
    container.bind(CheckoutController).toSelf();
    container.bind(ProfileController).toSelf();

    await container.resolve(AccountController).initializeAccount();
  }

  return { config, configSource, settings };
};
