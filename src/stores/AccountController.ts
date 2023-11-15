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
import AccountService, { type AccountServiceFeatures } from '#src/services/account.service';
import CheckoutService from '#src/services/checkout.service';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import * as persist from '#src/utils/persist';
import { ACCESS_MODEL, DEFAULT_FEATURES } from '#src/config';
import { assertFeature, assertModuleMethod, getNamedModule } from '#src/modules/container';
import type { IntegrationType } from '#types/Config';

const PERSIST_PROFILE = 'profile';

@injectable()
export default class AccountController {
  private readonly checkoutService: CheckoutService;
  private readonly accountService: AccountService;
  private readonly subscriptionService: SubscriptionService;
  private readonly favoritesController: FavoritesController;
  private readonly watchHistoryController: WatchHistoryController;
  private readonly profileController?: ProfileController;
  private readonly features: AccountServiceFeatures;

  constructor(
    @inject('INTEGRATION_TYPE') integrationType: IntegrationType,
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

    this.features = integrationType ? this.accountService.features : DEFAULT_FEATURES;
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

  initialize = async () => {
    useAccountStore.setState({
      loading: true,
    });
    const config = useConfigStore.getState().config;

    await this.profileController?.loadPersistedProfile();
    await this.accountService.initialize(config, this.logout);
    await this.loadUserData();

    useAccountStore.setState({ loading: false });
  };

  updatePersonalShelves = async () => {
    const { watchHistory } = useWatchHistoryStore.getState();
    const { favorites } = useFavoritesStore.getState();
    const { isSandbox } = useConfigStore.getState();
    const { getAccountInfo } = useAccountStore.getState();

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
      isSandbox,
    );
  };

  updateUser = async (values: FirstLastNameInput | EmailConfirmPasswordInput): Promise<ServiceResponse<Customer>> => {
    useAccountStore.setState({ loading: true });

    const { isSandbox } = useConfigStore.getState();
    const { user } = useAccountStore.getState();
    const { canUpdateEmail, canSupportEmptyFullName } = this.getFeatures();

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

    const response = await this.accountService.updateCustomer({ ...payload, id: user.id.toString() }, isSandbox);

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

  register = async (email: string, password: string, consents: CustomerConsent[]) => {
    const { config, accessModel } = useConfigStore.getState();

    useAccountStore.setState({ loading: true });
    const response = await this.accountService.register({ config, email, password, consents });

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
    const { isSandbox } = useConfigStore.getState();
    const { customer } = getAccountInfo();

    const { responseData } = await this.accountService.getCaptureStatus({ customer }, isSandbox);

    return responseData;
  };

  updateCaptureAnswers = async (capture: Capture): Promise<Capture> => {
    const { getAccountInfo } = useAccountStore.getState();
    const { accessModel } = useConfigStore.getState();
    const { isSandbox } = useConfigStore.getState();

    const { customer, customerConsents } = getAccountInfo();

    const response = await this.accountService.updateCaptureAnswers({ customer, ...capture }, isSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await this.afterLogin(response.responseData as Customer, customerConsents, accessModel, false);

    return response.responseData;
  };

  resetPassword = async (email: string, resetUrl: string) => {
    const { isSandbox, clientId: publisherId } = useConfigStore.getState();

    const response = await this.accountService.resetPassword(
      {
        customerEmail: email,
        publisherId,
        resetUrl,
      },
      isSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  };

  changePasswordWithOldPassword = async (oldPassword: string, newPassword: string, newPasswordConfirmation: string) => {
    const { isSandbox } = useConfigStore.getState();

    const response = await this.accountService.changePasswordWithOldPassword(
      {
        oldPassword,
        newPassword,
        newPasswordConfirmation,
      },
      isSandbox,
    );
    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  };

  changePasswordWithToken = async (customerEmail: string, newPassword: string, resetPasswordToken: string, newPasswordConfirmation: string) => {
    const { isSandbox, clientId: authProviderId } = useConfigStore.getState();

    const response = await this.accountService.changePasswordWithResetToken(
      { publisherId: authProviderId, customerEmail, newPassword, resetPasswordToken, newPasswordConfirmation },
      isSandbox,
    );

    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  };

  updateSubscription = async (status: 'active' | 'cancelled'): Promise<unknown> => {
    const { isSandbox } = useConfigStore.getState();
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
      isSandbox,
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
    const { isSandbox } = useConfigStore();
    const { getAccountInfo } = useAccountStore.getState();

    const { customerId } = getAccountInfo();

    assertModuleMethod(this.subscriptionService.updateCardDetails, 'updateCardDetails is not available in subscription service');

    const response = await this.subscriptionService.updateCardDetails(
      {
        cardName,
        cardNumber,
        cvc,
        expMonth,
        expYear,
        currency,
      },
      isSandbox,
    );
    const activePayment = (await this.subscriptionService.getActivePayment({ sandbox: isSandbox, customerId })) || null;

    useAccountStore.setState({
      loading: false,
      activePayment,
    });
    return response;
  };

  checkEntitlements = async (offerId?: string): Promise<unknown> => {
    const { isSandbox } = useConfigStore.getState();

    if (!offerId) {
      return false;
    }

    const { responseData } = await this.checkoutService.getEntitlements({ offerId }, isSandbox);
    return !!responseData?.accessGranted;
  };

  reloadActiveSubscription = async ({ delay }: { delay: number } = { delay: 0 }): Promise<unknown> => {
    useAccountStore.setState({ loading: true });

    const { isSandbox, config } = useConfigStore.getState();

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
      this.subscriptionService.getActiveSubscription({ sandbox: isSandbox, customerId, config }),
      this.subscriptionService.getAllTransactions({ sandbox: isSandbox, customerId }),
      this.subscriptionService.getActivePayment({ sandbox: isSandbox, customerId }),
    ]);

    let pendingOffer: Offer | null = null;

    // resolve and fetch the pending offer after upgrade/downgrade
    try {
      if (activeSubscription?.pendingSwitchId) {
        assertModuleMethod(this.checkoutService.getOffer, 'getOffer is not available in checkout service');
        assertModuleMethod(this.checkoutService.getSubscriptionSwitch, 'getSubscriptionSwitch is not available in checkout service');

        const switchOffer = await this.checkoutService.getSubscriptionSwitch({ switchId: activeSubscription.pendingSwitchId }, isSandbox);
        const offerResponse = await this.checkoutService.getOffer({ offerId: switchOffer.responseData.toOfferId }, isSandbox);

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
    const { canExportAccountData } = this.getFeatures();

    assertModuleMethod(this.accountService.exportAccountData, 'exportAccountData is not available in account service');
    assertFeature(canExportAccountData, 'Export account');

    return this.accountService?.exportAccountData(undefined, true);
  };

  getSocialLoginUrls = () => {
    const { config } = useConfigStore.getState();
    const { hasSocialURLs } = this.getFeatures();

    assertModuleMethod(this.accountService.getSocialUrls, 'getSocialUrls is not available in account service');
    assertFeature(hasSocialURLs, 'Social logins');

    return this.accountService.getSocialUrls(config);
  };

  deleteAccountData = async (password: string) => {
    const { canDeleteAccount } = this.getFeatures();

    assertModuleMethod(this.accountService.deleteAccount, 'deleteAccount is not available in account service');
    assertFeature(canDeleteAccount, 'Delete account');

    return this.accountService.deleteAccount({ password }, true);
  };

  getReceipt = async (transactionId: string) => {
    const { isSandbox } = useConfigStore.getState();

    assertModuleMethod(this.subscriptionService.fetchReceipt, 'fetchReceipt is not available in subscription service');

    const { responseData } = await this.subscriptionService.fetchReceipt({ transactionId }, isSandbox);

    return responseData;
  };

  getAuthData = async () => {
    return this.accountService.getAuthData();
  };

  subscribeToNotifications = async ({ uuid, onMessage }: SubscribeToNotificationsPayload) => {
    return this.accountService.subscribeToNotifications({ uuid, onMessage });
  };

  getFeatures() {
    return this.features;
  }

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
}
