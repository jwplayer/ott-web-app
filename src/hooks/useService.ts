import * as inplayerAccountService from '#src/services/inplayer.account.service';
import * as inplayerSubscriptionService from '#src/services/inplayer.subscription.service';
import * as inplayerCheckoutService from '#src/services/inplayer.checkout.service';
import * as cleengCheckoutService from '#src/services/cleeng.checkout.service';
import * as cleengSubscriptionService from '#src/services/cleeng.subscription.service';
import * as cleengAccountService from '#src/services/cleeng.account.service';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { AccessModel, Config } from '#types/Config';

export type CheckoutService = typeof inplayerCheckoutService | typeof cleengCheckoutService | undefined;
export type SubscriptionService = typeof inplayerSubscriptionService | typeof cleengSubscriptionService | undefined;
export type AccountService = typeof inplayerAccountService | typeof cleengAccountService;

function useService<T>(
  callback: (args: {
    accountService: AccountService;
    subscriptionService?: SubscriptionService;
    checkoutService?: CheckoutService;
    config: Config;
    accessModel: AccessModel;
    sandbox?: boolean;
    authProviderId?: string;
  }) => T,
): T {
  const { config, accessModel } = useConfigStore.getState();
  const { cleeng, inplayer, jwp } = config.integrations;

  // AUTHVOD or SVOD for InPlayer integration
  if (jwp?.clientId || inplayer?.clientId) {
    const integration = jwp?.clientId ? jwp : inplayer;
    return callback({
      accountService: inplayerAccountService,
      subscriptionService: inplayerSubscriptionService,
      checkoutService: inplayerCheckoutService,
      config,
      accessModel,
      sandbox: !!integration?.useSandbox,
      authProviderId: integration?.clientId?.toString(),
    });
  }

  // AUTHVOD or SVOD for Cleeng integration
  if (cleeng?.id) {
    return callback({
      accountService: cleengAccountService,
      subscriptionService: cleengSubscriptionService,
      checkoutService: cleengCheckoutService,
      config,
      accessModel,
      sandbox: !!cleeng.useSandbox,
      authProviderId: cleeng?.id,
    });
  }

  // AVOD
  return callback({
    config,
    accessModel,
    accountService: {} as AccountService,
  });
}

export default useService;
