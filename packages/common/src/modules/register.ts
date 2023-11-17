// To organize imports in a better way
/* eslint-disable import/order */
import 'reflect-metadata'; // include once in the app for inversify (see: https://github.com/inversify/InversifyJS/blob/master/README.md#-installation)
import { INTEGRATION } from '../constants';
import { container } from './container';

import ApiService from '../services/api.service';
import WatchHistoryService from '../services/watchhistory.service';
import EpgService from '../services/epg.service';
import GenericEntitlementService from '../services/genericEntitlement.service';
import JWPEntitlementService from '../services/jwpEntitlement.service';
import FavoritesService from '../services/favorites.service';
import ConfigService from '../services/config.service';
import SettingsService from '../services/settings.service';

import WatchHistoryController from '../stores/WatchHistoryController';
import CheckoutController from '../stores/CheckoutController';
import AccountController from '../stores/AccountController';
import ProfileController from '../stores/ProfileController';
import FavoritesController from '../stores/FavoritesController';
import AppController from '../stores/AppController';

// Integration interfaces
import AccountService from '../services/account.service';
import CheckoutService from '../services/checkout.service';
import SubscriptionService from '../services/subscription.service';
import ProfileService from '../services/profile.service';

// Cleeng integration
import CleengService from '../services/cleeng.service';
import CleengAccountService from '../services/cleeng.account.service';
import CleengCheckoutService from '../services/cleeng.checkout.service';
import CleengSubscriptionService from '../services/cleeng.subscription.service';

// InPlayer integration
import InplayerAccountService from '../services/inplayer.account.service';
import InplayerCheckoutService from '../services/inplayer.checkout.service';
import InplayerSubscriptionService from '../services/inplayer.subscription.service';
import InplayerProfileService from '../services/inplayer.profile.service';

// Common services
container.bind(ConfigService).toSelf();
container.bind(EpgService).toSelf();
container.bind(WatchHistoryService).toSelf();
container.bind(FavoritesService).toSelf();
container.bind(GenericEntitlementService).toSelf();
container.bind(ApiService).toSelf();
container.bind(SettingsService).toSelf();

// Common controllers
container.bind(AppController).toSelf();
container.bind(WatchHistoryController).toSelf();
container.bind(FavoritesController).toSelf();

// Integration controllers
container.bind(AccountController).toSelf();
container.bind(CheckoutController).toSelf();
container.bind(ProfileController).toSelf();

container.bind('INTEGRATION_TYPE').toDynamicValue((context) => {
  return context.container.get(AppController).getIntegrationType();
});

// Cleeng integration
container.bind(CleengService).toSelf();
container.bind(AccountService).to(CleengAccountService).whenTargetNamed(INTEGRATION.CLEENG);
container.bind(CheckoutService).to(CleengCheckoutService).whenTargetNamed(INTEGRATION.CLEENG);
container.bind(SubscriptionService).to(CleengSubscriptionService).whenTargetNamed(INTEGRATION.CLEENG);

// JWP integration
container.bind(JWPEntitlementService).toSelf();
container.bind(AccountService).to(InplayerAccountService).whenTargetNamed(INTEGRATION.JWP);
container.bind(CheckoutService).to(InplayerCheckoutService).whenTargetNamed(INTEGRATION.JWP);
container.bind(SubscriptionService).to(InplayerSubscriptionService).whenTargetNamed(INTEGRATION.JWP);
container.bind(ProfileService).to(InplayerProfileService).whenTargetNamed(INTEGRATION.JWP);
