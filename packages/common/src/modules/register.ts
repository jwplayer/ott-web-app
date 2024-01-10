// To organize imports in a better way
/* eslint-disable import/order */
import 'reflect-metadata'; // include once in the app for inversify (see: https://github.com/inversify/InversifyJS/blob/master/README.md#-installation)
import { INTEGRATION } from '../constants';
import { container } from './container';
import { DETERMINE_INTEGRATION_TYPE, INTEGRATION_TYPE } from './types';

import ApiService from '../services/ApiService';
import WatchHistoryService from '../services/WatchHistoryService';
import EpgService from '../services/EpgService';
import GenericEntitlementService from '../services/GenericEntitlementService';
import JWPEntitlementService from '../services/JWPEntitlementService';
import FavoriteService from '../services/FavoriteService';
import ConfigService from '../services/ConfigService';
import SettingsService from '../services/SettingsService';

import WatchHistoryController from '../stores/WatchHistoryController';
import CheckoutController from '../stores/CheckoutController';
import AccountController from '../stores/AccountController';
import ProfileController from '../stores/ProfileController';
import FavoritesController from '../stores/FavoritesController';
import AppController from '../stores/AppController';

// Integration interfaces
import AccountService from '../services/integrations/AccountService';
import CheckoutService from '../services/integrations/CheckoutService';
import SubscriptionService from '../services/integrations/SubscriptionService';
import ProfileService from '../services/ProfileService';

// Cleeng integration
import CleengService from '../services/integrations/cleeng/CleengService';
import CleengAccountService from '../services/integrations/cleeng/CleengAccountService';
import CleengCheckoutService from '../services/integrations/cleeng/CleengCheckoutService';
import CleengSubscriptionService from '../services/integrations/cleeng/CleengSubscriptionService';

// InPlayer integration
import JWPAccountService from '../services/integrations/jwp/JWPAccountService';
import JWPCheckoutService from '../services/integrations/jwp/JWPCheckoutService';
import JWPSubscriptionService from '../services/integrations/jwp/JWPSubscriptionService';
import JWPProfileService from '../services/integrations/jwp/JWPProfileService';
import { getIntegrationType } from './functions/getIntegrationType';
import { isCleengIntegrationType, isJwpIntegrationType } from './functions/calculateIntegrationType';

// Common services
container.bind(ConfigService).toSelf();
container.bind(EpgService).toSelf();
container.bind(WatchHistoryService).toSelf();
container.bind(FavoriteService).toSelf();
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

// Functions
container.bind(INTEGRATION_TYPE).toDynamicValue(getIntegrationType);

// Cleeng integration
container.bind(DETERMINE_INTEGRATION_TYPE).toConstantValue(isCleengIntegrationType);
container.bind(CleengService).toSelf();
container.bind(AccountService).to(CleengAccountService).whenTargetNamed(INTEGRATION.CLEENG);
container.bind(CheckoutService).to(CleengCheckoutService).whenTargetNamed(INTEGRATION.CLEENG);
container.bind(SubscriptionService).to(CleengSubscriptionService).whenTargetNamed(INTEGRATION.CLEENG);

// JWP integration
container.bind(DETERMINE_INTEGRATION_TYPE).toConstantValue(isJwpIntegrationType);
container.bind(JWPEntitlementService).toSelf();
container.bind(AccountService).to(JWPAccountService).whenTargetNamed(INTEGRATION.JWP);
container.bind(CheckoutService).to(JWPCheckoutService).whenTargetNamed(INTEGRATION.JWP);
container.bind(SubscriptionService).to(JWPSubscriptionService).whenTargetNamed(INTEGRATION.JWP);
container.bind(ProfileService).to(JWPProfileService).whenTargetNamed(INTEGRATION.JWP);
