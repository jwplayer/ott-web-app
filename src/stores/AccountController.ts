import i18next from 'i18next';

import { useProfileStore } from './ProfileStore';

import { queryClient } from '#src/containers/QueryProvider/QueryProvider';
import useAccount from '#src/hooks/useAccount';
import useService from '#src/hooks/useService';
import { getMediaByWatchlist } from '#src/services/api.service';
import { useAccountStore } from '#src/stores/AccountStore';
import { restoreFavorites, serializeFavorites } from '#src/stores/FavoritesController';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { restoreWatchHistory, serializeWatchHistory } from '#src/stores/WatchHistoryController';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { logDev } from '#src/utils/common';
import * as persist from '#src/utils/persist';
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
import { unpersistProfile } from '#src/hooks/useProfiles';

const PERSIST_PROFILE = 'profile';

export const initializeAccount = async () => {
  await useService(async ({ accountService, config }) => {
    if (!accountService) {
      useAccountStore.setState({ loading: false });
      return;
    }

    useAccountStore.setState({
      loading: true,
      canUpdateEmail: accountService.canUpdateEmail,
      canRenewSubscription: accountService.canRenewSubscription,
      canManageProfiles: accountService.canManageProfiles,
      canUpdatePaymentMethod: accountService.canUpdatePaymentMethod,
      canChangePasswordWithOldPassword: accountService.canChangePasswordWithOldPassword,
      canExportAccountData: accountService.canExportAccountData,
      canDeleteAccount: accountService.canExportAccountData,
      canShowReceipts: accountService.canShowReceipts,
    });

    useProfileStore.setState({
      profile: persist.getItem(PERSIST_PROFILE) || null,
    });

    await accountService.initialize(config, logout);

    try {
      const authData = await accountService.getAuthData();

      if (authData) {
        await getAccount();
        await restoreWatchHistory();
        await restoreFavorites();
      }
    } catch (error: unknown) {
      logDev('Failed to get user', error);

      // clear the session when the token was invalid
      // don't clear the session when the error is unknown (network hiccup or something similar)
      if (error instanceof Error && error.message.includes('Invalid JWT token')) {
        await logout();
      }
    }

    useAccountStore.setState({ loading: false });
  });
};

export async function updateUser(values: FirstLastNameInput | EmailConfirmPasswordInput): Promise<ServiceResponse<Customer>> {
  return await useService(async ({ accountService, sandbox = true }) => {
    useAccountStore.setState({ loading: true });

    const { user, canUpdateEmail } = useAccountStore.getState();

    if (Object.prototype.hasOwnProperty.call(values, 'email') && !canUpdateEmail) {
      throw new Error('Email update not supported');
    }

    if (!user) {
      throw new Error('User not logged in');
    }

    const errors = validateInputLength(values as FirstLastNameInput);
    if (errors.length) {
      return {
        errors,
        responseData: {} as Customer,
      };
    }

    let payload = values;
    // this is needed as a fallback when the name is empty (cannot be empty on JWP integration)
    if (!accountService.canSupportEmptyFullName) {
      payload = { ...values, email: user.email };
    }

    const response = await accountService.updateCustomer({ ...payload, id: user.id.toString() }, sandbox);

    if (!response) {
      throw new Error('Unknown error');
    }

    if (response.errors?.length === 0) {
      useAccountStore.setState({ user: response.responseData });
    }

    return response;
  });
}

export const getAccount = async () => {
  await useService(async ({ accountService, config, accessModel }) => {
    try {
      const response = await accountService.getUser({ config });
      if (response) {
        await afterLogin(response.user, response.customerConsents, accessModel);
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
  });
};

export const login = async (email: string, password: string) => {
  await useService(async ({ accountService, config, accessModel }) => {
    useAccountStore.setState({ loading: true });

    const response = await accountService.login({ config, email, password });
    if (response) {
      await afterLogin(response.user, response.customerConsents, accessModel);

      await restoreFavorites();
      await restoreWatchHistory();
    }

    useAccountStore.setState({ loading: false });
  });
};

async function clearLoginState() {
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
  unpersistProfile();

  await restoreFavorites();
  await restoreWatchHistory();
}

export async function logout(logoutOptions: { includeNetworkRequest: boolean } = { includeNetworkRequest: true }) {
  await useService(async ({ accountService }) => {
    persist.removeItem(PERSIST_PROFILE);

    // this invalidates all entitlements caches which makes the useEntitlement hook to verify the entitlements.
    await queryClient.invalidateQueries('entitlements');

    await clearLoginState();
    if (logoutOptions.includeNetworkRequest) {
      await accountService?.logout();
    }
  });
}

export const register = async (email: string, password: string) => {
  await useService(async ({ accountService, accessModel, config }) => {
    useAccountStore.setState({ loading: true });
    const response = await accountService.register({ config, email, password });
    if (response) {
      const { user, customerConsents } = response;
      await afterLogin(user, customerConsents, accessModel);
    }

    await updatePersonalShelves();
  });
};

export const updatePersonalShelves = async () => {
  await useAccount(async ({ customer }) => {
    await useService(async ({ accountService, sandbox = true }) => {
      const { watchHistory } = useWatchHistoryStore.getState();
      const { favorites } = useFavoritesStore.getState();
      if (!watchHistory && !favorites) return;

      const personalShelfData = {
        history: serializeWatchHistory(watchHistory),
        favorites: serializeFavorites(favorites),
      };

      return accountService?.updatePersonalShelves(
        {
          id: customer.id,
          externalData: personalShelfData,
        },
        sandbox,
      );
    });
  });
};

export const updateConsents = async (customerConsents: CustomerConsent[]): Promise<ServiceResponse<CustomerConsent[]>> => {
  return await useAccount(async ({ customer }) => {
    return await useService(async ({ accountService, config }) => {
      useAccountStore.setState({ loading: true });

      try {
        const response = await accountService?.updateCustomerConsents({
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
    });
  });
};

// TODO: Decide if it's worth keeping this or just leave combined with getUser
// noinspection JSUnusedGlobalSymbols
export async function getCustomerConsents(): Promise<GetCustomerConsentsResponse> {
  return await useAccount(async ({ customer }) => {
    return await useService(async ({ accountService, config }) => {
      const response = await accountService.getCustomerConsents({ config, customer });

      if (response?.consents) {
        useAccountStore.setState({ customerConsents: response.consents });
      }

      return response;
    });
  });
}

export const getPublisherConsents = async (): Promise<GetPublisherConsentsResponse> => {
  return await useService(async ({ accountService, config }) => {
    const response = await accountService.getPublisherConsents(config);

    useAccountStore.setState({ publisherConsents: response.consents });

    return response;
  });
};

export const getCaptureStatus = async (): Promise<GetCaptureStatusResponse> => {
  return await useAccount(async ({ customer }) => {
    return await useService(async ({ accountService, sandbox = true }) => {
      const { responseData } = await accountService.getCaptureStatus({ customer }, sandbox);

      return responseData;
    });
  });
};

export const updateCaptureAnswers = async (capture: Capture): Promise<Capture> => {
  return await useAccount(async ({ customer, customerConsents }) => {
    return await useService(async ({ accountService, accessModel, sandbox = true }) => {
      const response = await accountService.updateCaptureAnswers({ customer, ...capture }, sandbox);

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      await afterLogin(response.responseData as Customer, customerConsents, accessModel, false);

      return response.responseData;
    });
  });
};

export const resetPassword = async (email: string, resetUrl: string) => {
  return await useService(async ({ accountService, sandbox = true, authProviderId }) => {
    const response = await accountService.resetPassword(
      {
        customerEmail: email,
        publisherId: authProviderId,
        resetUrl,
      },
      sandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  });
};

export const changePasswordWithOldPassword = async (oldPassword: string, newPassword: string, newPasswordConfirmation: string) => {
  return await useService(async ({ accountService, sandbox = true }) => {
    const response = await accountService.changePasswordWithOldPassword(
      {
        oldPassword,
        newPassword,
        newPasswordConfirmation,
      },
      sandbox,
    );
    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  });
};

export const changePasswordWithToken = async (customerEmail: string, newPassword: string, resetPasswordToken: string, newPasswordConfirmation: string) => {
  return await useService(async ({ accountService, sandbox = true, authProviderId }) => {
    const response = await accountService.changePasswordWithResetToken(
      { publisherId: authProviderId, customerEmail, newPassword, resetPasswordToken, newPasswordConfirmation },
      sandbox,
    );
    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  });
};

export const updateSubscription = async (status: 'active' | 'cancelled'): Promise<unknown> => {
  return await useAccount(async ({ customerId }) => {
    return await useService(async ({ subscriptionService, sandbox = true }) => {
      if (!subscriptionService) throw new Error('subscription service is not configured');
      const { subscription } = useAccountStore.getState();
      if (!subscription) throw new Error('user has no active subscription');

      const response = await subscriptionService?.updateSubscription(
        {
          customerId,
          offerId: subscription.offerId,
          status,
          unsubscribeUrl: subscription.unsubscribeUrl,
        },
        sandbox,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      await reloadActiveSubscription({ delay: 2000 });

      return response?.responseData;
    });
  });
};

export const updateCardDetails = async ({
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
  return await useAccount(async ({ customerId }) => {
    return await useService(async ({ subscriptionService, sandbox = true }) => {
      const response = await subscriptionService?.updateCardDetails({ cardName, cardNumber, cvc, expMonth, expYear, currency }, sandbox);
      const activePayment = (await subscriptionService?.getActivePayment({ sandbox, customerId })) || null;
      useAccountStore.setState({
        loading: false,
        activePayment,
      });
      return response;
    });
  });
};

export async function checkEntitlements(offerId?: string): Promise<unknown> {
  return await useService(async ({ checkoutService, sandbox = true }) => {
    if (!checkoutService) throw new Error('checkout service is not configured');
    if (!offerId) {
      return false;
    }
    const { responseData } = await checkoutService.getEntitlements({ offerId }, sandbox);
    return !!responseData?.accessGranted;
  });
}

export async function reloadActiveSubscription({ delay }: { delay: number } = { delay: 0 }): Promise<unknown> {
  useAccountStore.setState({ loading: true });

  return await useAccount(async ({ customerId }) => {
    return await useService(async ({ subscriptionService, checkoutService, sandbox = true, config }) => {
      if (!subscriptionService) throw new Error('subscription service is not configured');
      // The subscription data takes a few seconds to load after it's purchased,
      // so here's a delay mechanism to give it time to process
      if (delay > 0) {
        return new Promise((resolve: (value?: unknown) => void) => {
          window.setTimeout(() => {
            reloadActiveSubscription().finally(resolve);
          }, delay);
        });
      }

      const [activeSubscription, transactions, activePayment] = await Promise.all([
        subscriptionService.getActiveSubscription({ sandbox, customerId, config }),
        subscriptionService.getAllTransactions({ sandbox, customerId }),
        subscriptionService.getActivePayment({ sandbox, customerId }),
      ]);

      let pendingOffer: Offer | null = null;

      // resolve and fetch the pending offer after upgrade/downgrade
      try {
        if (activeSubscription?.pendingSwitchId && checkoutService && 'getSubscriptionSwitch' in checkoutService) {
          const switchOffer = await checkoutService.getSubscriptionSwitch({ switchId: activeSubscription.pendingSwitchId }, sandbox);
          const offerResponse = await checkoutService.getOffer({ offerId: switchOffer.responseData.toOfferId }, sandbox);

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
    });
  });
}

export const exportAccountData = async () => {
  return await useAccount(async () => {
    return await useService(async ({ accountService }) => {
      return await accountService.exportAccountData(undefined, true);
    });
  });
};

export const getSocialLoginUrls = async () => {
  return await useService(async ({ accountService, config }) => {
    return await accountService.getSocialUrls(config);
  });
};

export const deleteAccountData = async (password: string) => {
  return await useAccount(async () => {
    return await useService(async ({ accountService }) => {
      return await accountService.deleteAccount({ password }, true);
    });
  });
};

export const getReceipt = async (transactionId: string) => {
  return await useAccount(async () => {
    return await useService(async ({ subscriptionService, sandbox = true }) => {
      if (!subscriptionService || !('fetchReceipt' in subscriptionService)) return null;

      const { responseData } = await subscriptionService.fetchReceipt({ transactionId }, sandbox);

      return responseData;
    });
  });
};

/**
 * Get multiple media items for the given IDs. This function uses watchlists to get several medias via just one request.
 *
 * @param watchlistId
 * @param mediaIds
 */
export async function getMediaItems(watchlistId: string | undefined | null, mediaIds: string[]) {
  if (!watchlistId) {
    throw new Error('No watchlist defined');
  }

  return getMediaByWatchlist(watchlistId, mediaIds);
}

async function afterLogin(user: Customer, customerConsents: CustomerConsent[] | null, accessModel: string, shouldSubscriptionReload: boolean = true) {
  useAccountStore.setState({
    user,
    customerConsents,
  });

  return await Promise.allSettled([
    accessModel === 'SVOD' && shouldSubscriptionReload ? reloadActiveSubscription() : Promise.resolve(),
    getPublisherConsents(),
  ]);
}

const validateInputLength = (values: { firstName: string; lastName: string }) => {
  const errors: string[] = [];
  if (Number(values?.firstName?.length) > 50) {
    errors.push(i18next.t('account:validation.first_name'));
  }
  if (Number(values?.lastName?.length) > 50) {
    errors.push(i18next.t('account:validation.last_name'));
  }

  return errors;
};
