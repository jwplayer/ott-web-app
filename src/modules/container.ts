// To organize imports in a better way
/* eslint-disable import/order */
import { Container, type interfaces } from 'inversify';

import ApiService from '#src/services/api.service';
import WatchHistoryService from '#src/services/watchhistory.service';
import EpgService from '#src/services/epg.service';
import EntitlementService from '#src/services/entitlement.service';
import FavoritesService from '#src/services/favorites.service';
import ConfigService from '#src/services/config.service';
import SettingsService from '#src/services/settings.service';

import WatchHistoryController from '#src/stores/WatchHistoryController';
import CheckoutController from '#src/stores/CheckoutController';
import AccountController from '#src/stores/AccountController';
import ProfileController from '#src/stores/ProfileController';
import FavoritesController from '#src/stores/FavoritesController';
import AppController from '#src/stores/AppController';

// Integration interfaces
import AccountService from '#src/services/account.service';
import CheckoutService from '#src/services/checkout.service';
import SubscriptionService from '#src/services/subscription.service';
import ProfileService from '#src/services/profile.service';

// Cleeng integration
import CleengService from '#src/services/cleeng.service';
import CleengAccountService from '#src/services/cleeng.account.service';
import CleengCheckoutService from '#src/services/cleeng.checkout.service';
import CleengSubscriptionService from '#src/services/cleeng.subscription.service';
import InplayerAccountService from '#src/services/inplayer.account.service';
import InplayerCheckoutService from '#src/services/inplayer.checkout.service';
import SubscriptionJWService from '#src/services/inplayer.subscription.service';
import InplayerProfileService from '#src/services/inplayer.profile.service';
import { INTEGRATION } from '#src/config';

export const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: false): T | undefined;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required: true): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>): T;
export function getModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, required = true): T | undefined {
  const module = container.getAll(constructorFunction)[0];

  if (required && !module) throw new Error(`Service '${String(constructorFunction)}' not found`);

  return module;
}

export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string, required: false): T | undefined;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string, required: true): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string): T;
export function getNamedModule<T>(constructorFunction: interfaces.ServiceIdentifier<T>, name: string, required = true): T | undefined {
  const module = container.getAllNamed(constructorFunction, name)[0];

  if (required && !module) throw new Error(`Service not found '${String(constructorFunction)}' with name '${name}'`);

  return module;
}

// Common services
container.bind(ConfigService).toSelf();
container.bind(EpgService).toSelf();
container.bind(WatchHistoryService).toSelf();
container.bind(FavoritesService).toSelf();
container.bind(EntitlementService).toSelf();
container.bind(ApiService).toSelf();
container.bind(SettingsService).toSelf();

// Common controllers
container.bind(AppController).toSelf();
container.bind(WatchHistoryController).toSelf();
container.bind(FavoritesController).toSelf();

// Integration controllers (conditionally register?)
container.bind(AccountController).toSelf();
container.bind(CheckoutController).toSelf();
container.bind(ProfileController).toSelf();

container.bind('INTEGRATION_TYPE').toDynamicValue((context) => {
  return context.container.get(AppController).getIntegration().integrationType;
});

// Cleeng integration
container.bind(CleengService).toSelf();
container.bind(AccountService).to(CleengAccountService).whenTargetNamed(INTEGRATION.CLEENG);
container.bind(CheckoutService).to(CleengCheckoutService).whenTargetNamed(INTEGRATION.CLEENG);
container.bind(SubscriptionService).to(CleengSubscriptionService).whenTargetNamed(INTEGRATION.CLEENG);

// JWP integration
container.bind(AccountService).to(InplayerAccountService).whenTargetNamed(INTEGRATION.JWP);
container.bind(CheckoutService).to(InplayerCheckoutService).whenTargetNamed(INTEGRATION.JWP);
container.bind(SubscriptionService).to(SubscriptionJWService).whenTargetNamed(INTEGRATION.JWP);
container.bind(ProfileService).to(InplayerProfileService).whenTargetNamed(INTEGRATION.JWP);
