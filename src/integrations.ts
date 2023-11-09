import CleengService from '#src/services/integrations/cleeng/cleeng.service';
import AccountService from '#src/services/account.service';
import CleengAccountService from '#src/services/integrations/cleeng/cleeng.account.service';
import CheckoutService from '#src/services/checkout.service';
import CleengCheckoutService from '#src/services/integrations/cleeng/cleeng.checkout.service';
import SubscriptionService from '#src/services/subscription.service';
import CleengSubscriptionService from '#src/services/integrations/cleeng/cleeng.subscription.service';
import InplayerAccountService from '#src/services/integrations/jwp/inplayer.account.service';
import InplayerCheckoutService from '#src/services/integrations/jwp/inplayer.checkout.service';
import SubscriptionJWService from '#src/services/integrations/jwp/inplayer.subscription.service';
import CleengProfileService from '#src/services/integrations/cleeng/cleeng.profile.service';
import InplayerProfileService from '#src/services/integrations/jwp/inplayer.profile.service';
import ProfileService from '#src/services/profile.service';
import { container, getModule } from '#src/container';
import AppController from '#src/stores/AppController';

const appController = getModule(AppController);

appController.registerIntegration({
  name: 'Cleeng',
  selector: (config) => !!config.integrations.cleeng?.id,
  register: () => {
    container.bind(CleengService).toSelf();
    container.bind(AccountService).to(CleengAccountService);
    container.bind(CheckoutService).to(CleengCheckoutService);
    container.bind(SubscriptionService).to(CleengSubscriptionService);
    container.bind(ProfileService).to(CleengProfileService);
  },
});

appController.registerIntegration({
  name: 'JWP',
  selector: (config) => !!config.integrations.jwp?.clientId,
  register: () => {
    container.bind(AccountService).to(InplayerAccountService);
    container.bind(CheckoutService).to(InplayerCheckoutService);
    container.bind(SubscriptionService).to(SubscriptionJWService);
    container.bind(ProfileService).to(InplayerProfileService);
  },
});
