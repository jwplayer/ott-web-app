import i18next from 'i18next';
import { injectable, inject } from 'inversify';

import FavoritesController from './FavoritesController';
import WatchHistoryController from './WatchHistoryController';
import ProfileController from './ProfileController';
import { useProfileStore } from './ProfileStore';

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
  SubscribeToNotificationsPayload,
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
import * as persist from '#src/utils/persist';
import { ACCESS_MODEL, INTEGRATION } from '#src/config';
import { getNamedModule } from '#src/container';

const PERSIST_PROFILE = 'profile';

@injectable()
export default class AccountController {
  private readonly checkoutService: CheckoutService;
  private readonly accountService: AccountService;
  private readonly subscriptionService: SubscriptionService;
  private readonly favoritesController: FavoritesController;
  private readonly watchHistoryController: WatchHistoryController;
  private readonly profileController?: ProfileController;

  constructor(
    @inject('INTEGRATION_TYPE') integrationType: keyof typeof INTEGRATION,
    favoritesController: FavoritesController,
    watchHistoryController: WatchHistoryController,
    profileController?: ProfileController,
  ) {
    this.checkoutService = getNamedModule(CheckoutService, integrationType);
    this.accountService = getNamedModule(AccountService, integrationType);
    this.subscriptionService = getNamedModule(SubscriptionService, integrationType);

    // @TODO refactor?
    this.favoritesController = favoritesController;
    this.watchHistoryController = watchHistoryController;
    this.profileController = profileController;
  }

  loadUserData = async () => {
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
  };

  initializeAccount = async () => {
    useAccountStore.setState({
      loading: true,
    });
    const config = useConfigStore.getState().config;

    const features = this.accountService.features;

    useAccountStore.setState({
      features: {
        hasIntegration: true,
        canDeleteAccount: features.canExportAccountData,
        canUpdateEmail: features.canUpdateEmail,
        canRenewSubscription: features.canRenewSubscription,
        canManageProfiles: features.canManageProfiles,
        canUpdatePaymentMethod: features.canUpdatePaymentMethod,
        canChangePasswordWithOldPassword: features.canChangePasswordWithOldPassword,
        canExportAccountData: features.canExportAccountData,
        canShowReceipts: features.canShowReceipts,
        canSupportEmptyFullName: features.canSupportEmptyFullName,
        hasNotifications: features.hasNotifications,
        hasSocialURLs: features.hasSocialURLs,
      },
    });

    await this.profileController?.loadPersistedProfile();
    await this.accountService.initialize(config, this.logout);
    await this.loadUserData();

    useAccountStore.setState({ loading: false });
  };

  updatePersonalShelves = async () => {
    const { watchHistory } = useWatchHistoryStore.getState();
    const { favorites } = useFavoritesStore.getState();
    const { getAccountInfo } = useAccountStore.getState();

    const { useSandbox } = this.getIntegration();
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
      useSandbox,
    );
  };

  updateUser = async (values: FirstLastNameInput | EmailConfirmPasswordInput): Promise<ServiceResponse<Customer>> => {
    useAccountStore.setState({ loading: true });

    const { useSandbox } = this.getIntegration();
    const { user } = useAccountStore.getState();
    const { canUpdateEmail, canSupportEmptyFullName } = useAccountStore.getState().features;

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
    if (!canSupportEmptyFullName) {
      payload = { ...values, email: user.email };
    }

    const response = await this.accountService.updateCustomer({ ...payload, id: user.id.toString() }, useSandbox);

    if (!response) {
      throw new Error('Unknown error');
    }

    if (response.errors?.length === 0) {
      useAccountStore.setState({ user: response.responseData });
    }

    return response;
  };

  getAccount = async () => {
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
  };

  login = async (email: string, password: string) => {
    const { config, accessModel } = useConfigStore.getState();

    useAccountStore.setState({ loading: true });

    const response = await this.accountService.login({ config, email, password });
    if (response) {
      await this.afterLogin(response.user, response.customerConsents, accessModel);

      await this.favoritesController?.restoreFavorites();
      await this.watchHistoryController?.restoreWatchHistory();
    }

    useAccountStore.setState({ loading: false });
  };

  logout = async (logoutOptions: { includeNetworkRequest: boolean } = { includeNetworkRequest: true }) => {
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

    persist.removeItem(PERSIST_PROFILE);

    // this invalidates all entitlements caches which makes the useEntitlement hook to verify the entitlements.
    await queryClient.invalidateQueries('entitlements');

    await this.clearLoginState();
    if (logoutOptions.includeNetworkRequest) {
      await this.accountService?.logout();
    }
  };

  register = async (email: string, password: string) => {
    const { config, accessModel } = useConfigStore.getState();

    useAccountStore.setState({ loading: true });

    const response = await this.accountService.register({ config, email, password });
    if (response) {
      const { user, customerConsents } = response;
      await this.afterLogin(user, customerConsents, accessModel);
    }

    await this.updatePersonalShelves();
  };

  updateConsents = async (customerConsents: CustomerConsent[]): Promise<ServiceResponse<CustomerConsent[]>> => {
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
  };

  // TODO: Decide if it's worth keeping this or just leave combined with getUser
  // noinspection JSUnusedGlobalSymbols
  getCustomerConsents = async (): Promise<GetCustomerConsentsResponse> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { config } = useConfigStore.getState();
    const { customer } = getAccountInfo();

    const response = await this.accountService.getCustomerConsents({ config, customer });

    if (response?.consents) {
      useAccountStore.setState({ customerConsents: response.consents });
    }

    return response;
  };

  getPublisherConsents = async (): Promise<GetPublisherConsentsResponse> => {
    const { config } = useConfigStore.getState();

    const response = await this.accountService.getPublisherConsents(config);

    useAccountStore.setState({ publisherConsents: response.consents });

    return response;
  };

  getCaptureStatus = async (): Promise<GetCaptureStatusResponse> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { useSandbox } = this.getIntegration();
    const { customer } = getAccountInfo();

    const { responseData } = await this.accountService.getCaptureStatus({ customer }, useSandbox);

    return responseData;
  };

  updateCaptureAnswers = async (capture: Capture): Promise<Capture> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { accessModel } = useConfigStore.getState();
    const { useSandbox } = this.getIntegration();

    const { customer, customerConsents } = getAccountInfo();

    const response = await this.accountService.updateCaptureAnswers({ customer, ...capture }, useSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await this.afterLogin(response.responseData as Customer, customerConsents, accessModel, false);

    return response.responseData;
  };

  resetPassword = async (email: string, resetUrl: string) => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    const response = await this.accountService.resetPassword(
      {
        customerEmail: email,
        publisherId: authProviderId,
        resetUrl,
      },
      useSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  changePasswordWithOldPassword = async (oldPassword: string, newPassword: string, newPasswordConfirmation: string) => {
    const { useSandbox } = this.getIntegration();

    const response = await this.accountService.changePasswordWithOldPassword(
      {
        oldPassword,
        newPassword,
        newPasswordConfirmation,
      },
      useSandbox,
    );
    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  };

  changePasswordWithToken = async (customerEmail: string, newPassword: string, resetPasswordToken: string, newPasswordConfirmation: string) => {
    const { useSandbox, clientId: authProviderId } = this.getIntegration();

    const response = await this.accountService.changePasswordWithResetToken(
      { publisherId: authProviderId, customerEmail, newPassword, resetPasswordToken, newPasswordConfirmation },
      useSandbox,
    );

    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  };

  updateSubscription = async (status: 'active' | 'cancelled'): Promise<unknown> => {
    const { useSandbox } = this.getIntegration();
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();

    const { subscription } = useAccountStore.getState();
    if (!subscription) throw new Error('user has no active subscription');

    const response = await this.subscriptionService?.updateSubscription(
      {
        customerId,
        offerId: subscription.offerId,
        status,
        unsubscribeUrl: subscription.unsubscribeUrl,
      },
      useSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await this.reloadActiveSubscription({ delay: 2000 });

    return response?.responseData;
  };

  updateCardDetails = async ({
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
  }) => {
    const { useSandbox: sandbox } = this.getIntegration();
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();

    if (typeof this.subscriptionService.updateCardDetails === 'undefined') {
      throw new Error('updateCardDetails is not available in subscription service');
    }

    const response = await this.subscriptionService.updateCardDetails(
      {
        cardName,
        cardNumber,
        cvc,
        expMonth,
        expYear,
        currency,
      },
      sandbox,
    );
    const activePayment = (await this.subscriptionService.getActivePayment({ sandbox, customerId })) || null;

    useAccountStore.setState({
      loading: false,
      activePayment,
    });
    return response;
  };

  checkEntitlements = async (offerId?: string): Promise<unknown> => {
    const { useSandbox } = this.getIntegration();

    if (!offerId) {
      return false;
    }

    const { responseData } = await this.checkoutService.getEntitlements({ offerId }, useSandbox);
    return !!responseData?.accessGranted;
  };

  reloadActiveSubscription = async ({ delay }: { delay: number } = { delay: 0 }): Promise<unknown> => {
    useAccountStore.setState({ loading: true });

    const { config } = useConfigStore.getState();
    const { useSandbox: sandbox } = this.getIntegration();

    const { getAccountInfo } = useAccountStore.getState();
    const { customerId } = getAccountInfo();

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
      if (activeSubscription?.pendingSwitchId) {
        if (typeof this.checkoutService.getOffer === 'undefined') {
          throw new Error('getOffer is not available in checkout service');
        }
        if (typeof this.checkoutService.getSubscriptionSwitch === 'undefined') {
          throw new Error('getSubscriptionSwitch is not available in checkout service');
        }

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
  };

  exportAccountData = async () => {
    const { canExportAccountData } = useAccountStore.getState().features;

    if (!canExportAccountData || typeof this.accountService.exportAccountData === 'undefined') {
      throw new Error('Export account feature is not enabled');
    }

    return this.accountService?.exportAccountData(undefined, true);
  };

  getSocialLoginUrls = () => {
    const { config } = useConfigStore.getState();
    const { hasSocialURLs } = useAccountStore.getState().features;

    if (!hasSocialURLs || typeof this.accountService.getSocialUrls === 'undefined') {
      throw new Error('Social logins feature is not enabled');
    }

    return this.accountService.getSocialUrls(config);
  };

  deleteAccountData = async (password: string) => {
    const { canDeleteAccount } = useAccountStore.getState().features;

    if (!canDeleteAccount || typeof this.accountService.deleteAccount === 'undefined') {
      throw new Error('Delete account feature is not enabled');
    }

    return this.accountService.deleteAccount({ password }, true);
  };

  getReceipt = async (transactionId: string) => {
    const { useSandbox } = this.getIntegration();

    if (typeof this.subscriptionService.fetchReceipt === 'undefined') {
      throw new Error('fetchReceipt is not available in subscription service');
    }

    const { responseData } = await this.subscriptionService.fetchReceipt({ transactionId }, useSandbox);

    return responseData;
  };

  getAuthData = async () => {
    return this.accountService.getAuthData();
  };

  subscribeToNotifications = async ({ uuid, onMessage }: SubscribeToNotificationsPayload) => {
    return this.accountService.subscribeToNotifications({ uuid, onMessage });
  };

  private async afterLogin(user: Customer, customerConsents: CustomerConsent[] | null, accessModel: string, shouldSubscriptionReload: boolean = true) {
    useAccountStore.setState({
      user,
      customerConsents,
    });

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

  private clearLoginState = async () => {
    useAccountStore.setState({
      user: null,
      subscription: null,
      transactions: null,
      activePayment: null,
      customerConsents: null,
      publisherConsents: null,
      loading: false,
    });

    useProfileStore.setState({
      profile: null,
      selectingProfileAvatar: null,
    });

    this.profileController?.unpersistProfile();

    await this.favoritesController?.restoreFavorites();
    await this.watchHistoryController?.restoreWatchHistory();
  };

  private getIntegration = () => {
    return useConfigStore.getState().getIntegration() ?? true;
  };
}
