import '@jwp/ott-common/src/modules/register';
import { container } from '@jwp/ott-common/src/modules/container';
import StorageService from '@jwp/ott-common/src/services/StorageService';
import { BROADCAST_CHANNEL, GET_CUSTOMER_IP } from '@jwp/ott-common/src/modules/types';
import type { GetCustomerIP } from '@jwp/ott-common/types/get-customer-ip';
import LogTransporter from '@jwp/ott-common/src/services/logging/LogTransporter';
import ConsoleTransporter from '@jwp/ott-common/src/services/logging/ConsoleTransporter';
import { LogLevel } from '@jwp/ott-common/src/services/logging/LogLevel';
import { BroadcastChannel } from 'broadcast-channel';

import { getOverrideIP } from '#src/utils/ip';
import { LocalStorageService } from '#src/services/LocalStorageService';

/**
 * Custom integration override
 *
 * @example
 * ```ts
 * // Custom integration services
 * const MY_INTEGRATION_NAME = 'CUSTOM';
 *
 * container.bind(AccountService).to(CustomAccountService).whenTargetNamed(MY_INTEGRATION_NAME);
 * container.bind(CheckoutService).to(CustomCheckoutService).whenTargetNamed(MY_INTEGRATION_NAME);
 * container.bind(SubscriptionService).to(CustomSubscriptionService).whenTargetNamed(MY_INTEGRATION_NAME);
 *
 * // Override integration type calculation
 * container.bind(DETERMINE_INTEGRATION_TYPE).toConstantValue((config: Config) => {
 *   return config.custom?.['custom'] ? MY_INTEGRATION_NAME : null;
 * })
 * ```
 */

container.bind(StorageService).to(LocalStorageService);

container.bind(BROADCAST_CHANNEL).toConstantValue(new BroadcastChannel('jwp-refresh-token-channel'));

// Currently, this is only used for e2e testing to override the customer ip from a browser cookie
container.bind<GetCustomerIP>(GET_CUSTOMER_IP).toConstantValue(async () => getOverrideIP());

/**
 * Log transporters
 *
 * Add custom log transporters by registering more modules to the LogTransporter type. The custom transporter must
 * extend the LogTransporter class.
 *
 * @example
 * ```ts
 * container.bind<LogTransporter>(LogTransporter).toDynamicValue(() => new GoogleGTMTransporter(import.meta.env.DEV ? LogLevel.SILENT : LogLevel.WARN));
 * ```
 */
container.bind<LogTransporter>(LogTransporter).toDynamicValue(() => new ConsoleTransporter(import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.ERROR));

/**
 * UI Component override
 *
 * @example
 * ```ts
 * // Define an identifier from the component (from `ui-react` for example):
 * export const CardIdentifier = Symbol('CARD');
 *
 * // Make sure the component is wrapped in the HOC:
 * export default createInjectableComponent(CardIdentifier, Card);
 *
 * // Override the component into the associated container, from register.ts:
 * import { container as uiComponentContainer } from '@jwp/ott-ui-react/src/modules/container';
 *
 * uiComponentContainer.bind<React.FC<CardProps>>(CardIdentifier).toConstantValue(CustomCard);
 * ```
 */

// Override ui-react component
// uiComponentContainer.bind<React.FC<CardProps>>(CardIdentifier).toConstantValue(CustomCard);
