// To organize imports in a better way
/* eslint-disable import/order */
import { Container } from 'inversify';

import ApiService from '#src/services/api.service';
import WatchHistoryService from '#src/services/watchhistory.service';
import EpgService from '#src/services/epg.service';
import EntitlementService from '#src/services/entitlement.service';
import FavoritesService from '#src/services/favorites.service';
import ConfigService from '#src/services/config.service';


import ApiController from '#src/stores/ApiController';
import WatchHistoryController from '#src/stores/WatchHistoryController';
import CheckoutController from '#src/stores/CheckoutController';
import AccountController from '#src/stores/AccountController';
import EpgController from '#src/stores/EpgController';
import EntitlementController from '#src/stores/EntitlementController';
import ProfileController from '#src/stores/ProfileController';
import FavoritesController from '#src/stores/FavoritesController';
import AppController from '#src/stores/AppController';
import { SettingsController } from '#src/stores/SettingsController';
import type { interfaces } from 'inversify';

export const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

// resolve shortcut
export const getModule = <T>(constructorFunction: interfaces.Newable<T>): T => {
  return container.resolve(constructorFunction);
}

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

container.bind(AccountController).toSelf();
container.bind(CheckoutController).toSelf();
container.bind(ProfileController).toSelf();
container.bind(AppController).toSelf();
container.bind(SettingsController).toSelf();
