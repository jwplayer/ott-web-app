import i18next from 'i18next';
import { injectable, optional } from 'inversify';

import FavoritesController from './FavoritesController';
import WatchHistoryController from './WatchHistoryController';

import { useConfigStore } from '#src/stores/ConfigStore';
import type {
  Capture,
  Customer,
  CustomerConsent,
  EmailConfirmPasswordInput,
  FirstLastNameInput,
  GetCaptureStatusResponse,
  GetCustomerConsentsResponse,
  GetPublisherConsentsResponse,
} from '#types/account';
import type { Offer } from '#types/checkout';
import { useAccountStore } from '#src/stores/AccountStore';
import { queryClient } from '#src/containers/QueryProvider/QueryProvider';
import { logDev } from '#src/utils/common';
import SubscriptionService from '#src/services/subscription.service';
import AccountService from '#src/services/account.service';
import CheckoutService from '#src/services/checkout.service';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { addQueryParams } from '#src/utils/formatting';
import { simultaneousLoginWarningKey } from '#components/LoginForm/LoginForm';
import { ACCESS_MODEL } from '#src/config';

enum NotificationsTypes {
  ACCESS_GRANTED = 'access.granted',
  ACCESS_REVOKED = 'access.revoked',
  CARD_REQUIRES_ACTION = 'payment.card.requires.action',
  SUBSCRIBE_REQUIRES_ACTION = 'subscribe.requires.action',
  FAILED = '.failed',
  SUBSCRIBE_FAILED = 'subscribe.failed',
  ACCOUNT_LOGOUT = 'account.logout',
}

@injectable()
export default class AccountController {
  private readonly checkoutService: CheckoutService;
  private readonly accountService: AccountService;
  private readonly subscriptionService: SubscriptionService;
  private readonly favoritesController?: FavoritesController;
  private readonly watchHistoryController?: WatchHistoryController;

  constructor(
    checkoutService: CheckoutService,
    accountService: AccountService,
    subscriptionService: SubscriptionService,
    @optional() favoritesController?: FavoritesController,
    @optional() watchHistoryController?: WatchHistoryController,
  ) {
    this.checkoutService = checkoutService;
    this.accountService = accountService;
    this.subscriptionService = subscriptionService;
    this.favoritesController = favoritesController;
    this.watchHistoryController = watchHistoryController;
  }

  async initializeAccount() {
    const { config } = useConfigStore.getState();

    if (!this.accountService) {
      useAccountStore.setState({ loading: false });
      return;
    }

    const { canUpdateEmail, canRenewSubscription, canUpdatePaymentMethod, canChangePasswordWithOldPassword, canExportAccountData, canShowReceipts } =
      this.accountService.features;

    useAccountStore.setState({
      loading: true,
      canUpdateEmail,
      canRenewSubscription,
      canUpdatePaymentMethod,
      canChangePasswordWithOldPassword,
      canExportAccountData,
      canDeleteAccount: canExportAccountData,
      canShowReceipts,
    });

    await this.accountService.initialize(config, this.logout);

    try {
      const authData = await this.accountService.getAuthData();

      if (authData) {
        await this.getAccount();
        await this.watchHistoryController?.restoreWatchHistory();
        await this.favoritesController?.restoreFavorites();
      }
    } catch (error: unknown) {
      logDev('Failed to get user', error);

      // clear the session when the token was invalid
      // don't clear the session when the error is unknown (network hiccup or something similar)
      if (error instanceof Error && error.message.includes('Invalid JWT token')) {
        await this.logout();
      }
    }

    useAccountStore.setState({ loading: false });
  }

  async updatePersonalShelves() {
    const { watchHistory } = useWatchHistoryStore.getState();
    const { favorites } = useFavoritesStore.getState();
    const { getAccountInfo } = useAccountStore.getState();
    const { getSandbox } = useConfigStore.getState();

    const sandbox = getSandbox();
    const { customer } = getAccountInfo();

    if (!watchHistory && !favorites) return;

    const personalShelfData = {
      history: this.watchHistoryController?.serializeWatchHistory(watchHistory),
      favorites: this.favoritesController?.serializeFavorites(favorites),
    };

    return this.accountService?.updatePersonalShelves(
      {
        id: customer.id,
        externalData: personalShelfData,
      },
      sandbox,
    );
  }

  async updateUser(values: FirstLastNameInput | EmailConfirmPasswordInput): Promise<ServiceResponse<Customer>> {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox() || true;

    useAccountStore.setState({ loading: true });

    const { user, canUpdateEmail } = useAccountStore.getState();

    if (Object.prototype.hasOwnProperty.call(values, 'email') && !canUpdateEmail) {
      throw new Error('Email update not supported');
    }

    if (!user) {
      throw new Error('User not logged in');
    }

    const errors = this.validateInputLength(values as FirstLastNameInput);
    if (errors.length) {
      return {
        errors,
        responseData: {} as Customer,
      };
    }

    let payload = values;
    // this is needed as a fallback when the name is empty (cannot be empty on JWP integration)
    if (!this.accountService.features.canSupportEmptyFullName) {
      payload = { ...values, email: user.email };
    }

    const response = await this.accountService.updateCustomer({ ...payload, id: user.id.toString() }, sandbox);

    if (!response) {
      throw new Error('Unknown error');
    }

    if (response.errors?.length === 0) {
      useAccountStore.setState({ user: response.responseData });
    }

    return response;
  }

  async getAccount() {
    const { config, accessModel } = useConfigStore.getState();

    try {
      const response = await this.accountService.getUser({ config });
      if (response) {
        await this.afterLogin(response.user, response.customerConsents, accessModel);
      }

      useAccountStore.setState({ loading: false });
    } catch (error: unknown) {
      useAccountStore.setState({
        user: null,
        subscription: null,
        transactions: null,
        activePayment: null,
        customerConsents: null,
        publisherConsents: null,
        loading: false,
      });
    }
  }

  async login(email: string, password: string) {
    const { config, accessModel } = useConfigStore.getState();

    useAccountStore.setState({ loading: true });

    const response = await this.accountService.login({ config, email, password });
    if (response) {
      await this.afterLogin(response.user, response.customerConsents, accessModel);
      await this.favoritesController?.restoreFavorites();
      await this.watchHistoryController?.restoreWatchHistory();
    }

    useAccountStore.setState({ loading: false });
  }

  async logout() {
    // this invalidates all entitlements caches which makes the useEntitlement hook to verify the entitlements.
    await queryClient.invalidateQueries('entitlements');

    useAccountStore.setState({
      user: null,
      subscription: null,
      transactions: null,
      activePayment: null,
      customerConsents: null,
      publisherConsents: null,
      loading: false,
    });

    await this.favoritesController?.restoreFavorites();
    await this.watchHistoryController?.restoreWatchHistory();
    await this.accountService?.logout();
  }

  async register(email: string, password: string) {
    const { config, accessModel } = useConfigStore.getState();

    useAccountStore.setState({ loading: true });
    const response = await this.accountService.register({ config, email, password });
    if (response) {
      const { user, customerConsents } = response;
      await this.afterLogin(user, customerConsents, accessModel);
    }

    await this.updatePersonalShelves();
  }

  async updateConsents(customerConsents: CustomerConsent[]): Promise<ServiceResponse<CustomerConsent[]>> {
    const { getAccountInfo } = useAccountStore.getState();
    const { config } = useConfigStore.getState();
    const { customer } = getAccountInfo();

    useAccountStore.setState({ loading: true });

    try {
      const response = await this.accountService?.updateCustomerConsents({
        config,
        customer,
        consents: customerConsents,
      });

      if (response?.consents) {
        useAccountStore.setState({ customerConsents: response.consents });
        return {
          responseData: response.consents,
          errors: [],
        };
      }
      return {
        responseData: [],
        errors: [],
      };
    } finally {
      useAccountStore.setState({ loading: false });
    }
  }

  // TODO: Decide if it's worth keeping this or just leave combined with getUser
  // noinspection JSUnusedGlobalSymbols
  async getCustomerConsents(): Promise<GetCustomerConsentsResponse> {
    const { getAccountInfo } = useAccountStore.getState();
    const { config } = useConfigStore.getState();
    const { customer } = getAccountInfo();

    const response = await this.accountService.getCustomerConsents({ config, customer });

    if (response?.consents) {
      useAccountStore.setState({ customerConsents: response.consents });
    }

    return response;
  }

  async getPublisherConsents(): Promise<GetPublisherConsentsResponse> {
    const { config } = useConfigStore.getState();

    const response = await this.accountService.getPublisherConsents(config);

    useAccountStore.setState({ publisherConsents: response.consents });

    return response;
  }

  async getCaptureStatus(): Promise<GetCaptureStatusResponse> {
    const { getAccountInfo } = useAccountStore.getState();
    const { getSandbox } = useConfigStore.getState();
    const { customer } = getAccountInfo();
    const sandbox = getSandbox();

    const { responseData } = await this.accountService.getCaptureStatus({ customer }, sandbox);

    return responseData;
  }

  async updateCaptureAnswers(capture: Capture): Promise<Capture> {
    const { getAccountInfo } = useAccountStore.getState();
    const { getSandbox, accessModel } = useConfigStore.getState();
    const { customer, customerConsents } = getAccountInfo();
    const sandbox = getSandbox();

    const response = await this.accountService.updateCaptureAnswers({ customer, ...capture }, sandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await this.afterLogin(response.responseData as Customer, customerConsents, accessModel, false);

    return response.responseData;
  }

  async resetPassword(email: string, resetUrl: string) {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();
    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    const response = await this.accountService.resetPassword(
      {
        customerEmail: email,
        publisherId: authProviderId,
        resetUrl,
      },
      sandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  }

  async changePasswordWithOldPassword(oldPassword: string, newPassword: string, newPasswordConfirmation: string) {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox();

    const response = await this.accountService.changePasswordWithOldPassword(
      {
        oldPassword,
        newPassword,
        newPasswordConfirmation,
      },
      sandbox,
    );
    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  }

  async changePasswordWithToken(customerEmail: string, newPassword: string, resetPasswordToken: string, newPasswordConfirmation: string) {
    const { getSandbox, getAuthProvider } = useConfigStore.getState();
    const sandbox = getSandbox();
    const authProviderId = getAuthProvider();

    const response = await this.accountService.changePasswordWithResetToken(
      { publisherId: authProviderId, customerEmail, newPassword, resetPasswordToken, newPasswordConfirmation },
      sandbox,
    );
    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  }

  async updateSubscription(status: 'active' | 'cancelled'): Promise<unknown> {
    const { getSandbox } = useConfigStore.getState();
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();
    const sandbox = getSandbox();

    if (!this.subscriptionService) throw new Error('subscription service is not configured');
    const { subscription } = useAccountStore.getState();
    if (!subscription) throw new Error('user has no active subscription');

    const response = await this.subscriptionService?.updateSubscription(
      {
        customerId,
        offerId: subscription.offerId,
        status,
        unsubscribeUrl: subscription.unsubscribeUrl,
      },
      sandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await this.reloadActiveSubscription({ delay: 2000 });

    return response?.responseData;
  }

  async updateCardDetails({
    cardName,
    cardNumber,
    cvc,
    expMonth,
    expYear,
    currency,
  }: {
    cardName: string;
    cardNumber: string;
    cvc: number;
    expMonth: number;
    expYear: number;
    currency: string;
  }) {
    const { getSandbox } = useConfigStore.getState();
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();
    const sandbox = getSandbox();

    const response = await this.subscriptionService?.updateCardDetails({ cardName, cardNumber, cvc, expMonth, expYear, currency }, sandbox);
    const activePayment = (await this.subscriptionService?.getActivePayment({ sandbox, customerId })) || null;
    useAccountStore.setState({
      loading: false,
      activePayment,
    });
    return response;
  }

  async checkEntitlements(offerId?: string): Promise<unknown> {
    const { getSandbox } = useConfigStore.getState();

    const sandbox = getSandbox();

    if (!this.checkoutService) throw new Error('checkout service is not configured');
    if (!offerId) {
      return false;
    }
    const { responseData } = await this.checkoutService.getEntitlements({ offerId }, sandbox);
    return !!responseData?.accessGranted;
  }

  async reloadActiveSubscription({ delay }: { delay: number } = { delay: 0 }): Promise<unknown> {
    useAccountStore.setState({ loading: true });
    const { getSandbox, config } = useConfigStore.getState();
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();
    const sandbox = getSandbox();

    if (!this.subscriptionService) throw new Error('subscription service is not configured');
    // The subscription data takes a few seconds to load after it's purchased,
    // so here's a delay mechanism to give it time to process
    if (delay > 0) {
      return new Promise((resolve: (value?: unknown) => void) => {
        window.setTimeout(() => {
          this.reloadActiveSubscription().finally(resolve);
        }, delay);
      });
    }

    const [activeSubscription, transactions, activePayment] = await Promise.all([
      this.subscriptionService.getActiveSubscription({ sandbox, customerId, config }),
      this.subscriptionService.getAllTransactions({ sandbox, customerId }),
      this.subscriptionService.getActivePayment({ sandbox, customerId }),
    ]);

    let pendingOffer: Offer | null = null;

    // resolve and fetch the pending offer after upgrade/downgrade
    try {
      if (activeSubscription?.pendingSwitchId && this.checkoutService && 'getSubscriptionSwitch' in this.checkoutService) {
        const switchOffer = await this.checkoutService.getSubscriptionSwitch({ switchId: activeSubscription.pendingSwitchId }, sandbox);
        const offerResponse = await this.checkoutService.getOffer({ offerId: switchOffer.responseData.toOfferId }, sandbox);

        pendingOffer = offerResponse.responseData;
      }
    } catch (error: unknown) {
      logDev('Failed to fetch the pending offer', error);
    }

    // this invalidates all entitlements caches which makes the useEntitlement hook to verify the entitlements.
    await queryClient.invalidateQueries('entitlements');

    useAccountStore.setState({
      subscription: activeSubscription,
      pendingOffer,
      loading: false,
      transactions,
      activePayment,
    });
  }

  async exportAccountData() {
    return this.accountService.exportAccountData(undefined, true);
  }

  async getSocialLoginUrls() {
    const { config } = useConfigStore.getState();

    return this.accountService.getSocialUrls(config);
  }

  async deleteAccountData(password: string) {
    return this.accountService.deleteAccount({ password }, true);
  }

  async getReceipt(transactionId: string) {
    const { getSandbox } = useConfigStore.getState();
    const sandbox = getSandbox();

    if (!this.subscriptionService || !('fetchReceipt' in this.subscriptionService)) return null;

    const { responseData } = await this.subscriptionService.fetchReceipt({ transactionId }, sandbox);

    return responseData;
  }

  private async afterLogin(user: Customer, customerConsents: CustomerConsent[] | null, accessModel: string, shouldSubscriptionReload: boolean = true) {
    useAccountStore.setState({
      user,
      customerConsents,
    });

    this.subscribeToNotifications(user.uuid);

    return await Promise.allSettled([
      accessModel === ACCESS_MODEL.SVOD && shouldSubscriptionReload ? this.reloadActiveSubscription() : Promise.resolve(),
      this.getPublisherConsents(),
    ]);
  }

  private validateInputLength = (values: { firstName: string; lastName: string }) => {
    const errors: string[] = [];
    if (Number(values?.firstName?.length) > 50) {
      errors.push(i18next.t('account:validation.first_name'));
    }
    if (Number(values?.lastName?.length) > 50) {
      errors.push(i18next.t('account:validation.last_name'));
    }

    return errors;
  };

  async subscribeToNotifications(uuid: string = '') {
    return await this.accountService.subscribeToNotifications({
      uuid,
      onMessage: async (message) => {
        if (message) {
          const notification = JSON.parse(message);
          switch (notification.type) {
            case NotificationsTypes.FAILED:
            case NotificationsTypes.SUBSCRIBE_FAILED:
              window.location.href = addQueryParams(window.location.href, { u: 'payment-error', message: notification.resource?.message });
              break;
            case NotificationsTypes.ACCESS_GRANTED:
              await this.reloadActiveSubscription();
              break;
            case NotificationsTypes.ACCESS_REVOKED:
              await this.reloadActiveSubscription();
              break;
            case NotificationsTypes.CARD_REQUIRES_ACTION:
            case NotificationsTypes.SUBSCRIBE_REQUIRES_ACTION:
              window.location.href = notification.resource?.redirect_to_url;
              break;
            case NotificationsTypes.ACCOUNT_LOGOUT:
              if (notification.resource?.reason === 'sessions_limit') {
                window.location.href = addQueryParams(window.location.href, { u: 'login', message: simultaneousLoginWarningKey });
              } else {
                await this.logout();
              }
              break;
            default:
              break;
          }
        }
      },
    });
  }

  getAuthData() {
    return this.accountService.getAuthData();
  }
}
