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
import EpgService from '#src/services/epg.service';
import EntitlementService from '#src/services/entitlement.service';
import FavoritesService from '#src/services/favorites.service';
import ConfigService from '#src/services/config.service';
import CleengProfileService from '#src/services/cleeng.profile.service';
import InplayerProfileService from '#src/services/inplayer.profile.service';

import ApiController from '#src/stores/ApiController';
import WatchHistoryController from '#src/stores/WatchHistoryController';
import CheckoutController from '#src/stores/CheckoutController';
import AccountController from '#src/stores/AccountController';
import EpgController from '#src/stores/EpgController';
import EntitlementController from '#src/stores/EntitlementController';
import ProfileController from '#src/stores/ProfileController';
import FavoritesController from '#src/stores/FavoritesController';
import AppController from '#src/stores/AppController2';
import { INTEGRATION } from '#src/config';

import { container } from './container';

container.unbindAll();

// Common services
container.bind(ConfigService).toSelf();
container.bind(EpgService).toSelf();
container.bind(WatchHistoryService).toSelf();
container.bind(FavoritesService).toSelf();
container.bind(EntitlementService).toSelf();
container.bind(ApiService).toSelf();

// Common controllers
container.bind(ApiController).toSelf();
container.bind(EpgController).toSelf();
container.bind(WatchHistoryController).toSelf();
container.bind(FavoritesController).toSelf();
container.bind(EntitlementController).toSelf();

container.bind(CleengService).toSelf();
container.bind(CleengAccountService).toSelf();
container.bind(CleengCheckoutService).toSelf();
container.bind(CleengSubscriptionService).toSelf();
container.bind(CleengProfileService).toSelf();

container.bind(InplayerAccountService).toSelf();
container.bind(InplayerCheckoutService).toSelf();
container.bind(SubscriptionJWService).toSelf();
container.bind(InplayerProfileService).toSelf();

container.bind(AccountController).toSelf();
container.bind(CheckoutController).toSelf();
container.bind(ProfileController).toSelf();
container.bind(AppController).toSelf();

container.bind<AccountService | undefined>(AccountService).toDynamicValue(({ container }) => {
  const applicationController = container.resolve(AppController);
  const authProviderName = applicationController.getIntegration().integrationType;

  if (!applicationController.isReady()) throw new Error('Requested the AccountService before the config has been loaded');

  if (authProviderName === INTEGRATION.JWP) return container.resolve(InplayerAccountService);
  if (authProviderName === INTEGRATION.CLEENG) return container.resolve(CleengAccountService);
});

container.bind<CheckoutService | undefined>(CheckoutService).toDynamicValue(({ container }) => {
  const applicationController = container.resolve(AppController);
  const authProviderName = applicationController.getIntegration().integrationType;

  if (!applicationController.isReady()) throw new Error('Requested the CheckoutService before the config has been loaded');

  if (authProviderName === INTEGRATION.JWP) return container.resolve(InplayerCheckoutService);
  if (authProviderName === INTEGRATION.CLEENG) return container.resolve(CleengCheckoutService);
});

container.bind<SubscriptionService | undefined>(SubscriptionService).toDynamicValue(({ container }) => {
  const applicationController = container.resolve(AppController);
  const authProviderName = applicationController.getIntegration().integrationType;

  if (!applicationController.isReady()) throw new Error('Requested the SubscriptionService before the config has been loaded');

  if (authProviderName === INTEGRATION.JWP) return container.resolve(SubscriptionJWService);
  if (authProviderName === INTEGRATION.CLEENG) return container.resolve(CleengSubscriptionService);
});

container.bind<ProfileService | undefined>(ProfileService).toDynamicValue(({ container }) => {
  const applicationController = container.resolve(AppController);
  const authProviderName = applicationController.getIntegration().integrationType;

  if (!applicationController.isReady()) throw new Error('Requested the ProfileService before the config has been loaded');

  if (authProviderName === INTEGRATION.JWP) return container.resolve(InplayerProfileService);
  if (authProviderName === INTEGRATION.CLEENG) return container.resolve(CleengProfileService);
});
