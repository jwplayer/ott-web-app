import i18next from 'i18next';

import type {
  AuthData,
  Capture,
  Customer,
  CustomerConsent,
  EmailConfirmPasswordInput,
  FirstLastNameInput,
  GetCaptureStatusResponse,
  GetCustomerConsentsResponse,
  GetPublisherConsentsResponse,
} from '#types/account';
import { useConfigStore } from '#src/stores/ConfigStore';
import { useAccountStore } from '#src/stores/AccountStore';
import { restoreWatchHistory } from '#src/stores/WatchHistoryController';
import { restoreFavorites } from '#src/stores/FavoritesController';
import { getMediaByWatchlist } from '#src/services/api.service';
import useService from '#src/hooks/useService';
import useAccount from '#src/hooks/useAccount';
import { queryClient } from '#src/containers/QueryProvider/QueryProvider';
import { createIntegration, withIntegration, withOptionalIntegration } from '#src/integration';
import type { AccountDetails } from '#types/app';
import { FormErrors } from '#src/errors/FormErrors';

export const initializeAccount = async () => {
  const { config } = useConfigStore.getState();

  // set the loading state
  useAccountStore.setState({ loading: true });

  const integration = await createIntegration(config);

  if (integration) {
    const features = await integration.getFeatures();
    const account = await integration.initialize();

    useAccountStore.setState({
      user: account,
      canUpdateEmail: features.canUpdateEmail,
      canRenewSubscription: features.canRenewSubscription,
      canChangePasswordWithOldPassword: features.canChangePasswordWithOldPassword,
    });
  }

  await restoreFavorites();
  await restoreWatchHistory();

  useAccountStore.setState({ loading: false });
};

export async function updateUser(values: FirstLastNameInput | EmailConfirmPasswordInput): Promise<AccountDetails> {
  return await withIntegration(async (integration) => {
    useAccountStore.setState({ loading: true });

    const { user } = useAccountStore.getState();

    if (!user) {
      throw new Error('no auth');
    }

    // only update the email
    // TODO: split into separate controller method?
    if ('email' in values) {
      const updatedUser = await integration.updateUserEmail(values);
      useAccountStore.setState({ user: updatedUser, loading: false });

      return updatedUser;
    }

    // TODO: move to integration?
    const errors = validateInputLength(values);
    if (errors.length) {
      throw new FormErrors(errors);
    }

    // TODO: do this in the JWP integration
    // let payload = values;
    //   // this is needed as a fallback when the name is empty (cannot be empty on JWP integration)
    //   if (!accountService.canSupportEmptyFullName) {
    //     payload = { ...values, email: user.email };
    //   }

    const updatedUser = await integration.updateUserProfile(values);
    useAccountStore.setState({ user: updatedUser, loading: false });

    return updatedUser;
  });
}

export const getAccount = async (auth: AuthData) => {
  await useService(async ({ accountService, config, accessModel }) => {
    const response = await accountService.getUser({ config, auth });
    if (response) {
      await afterLogin(auth, response.user, response.customerConsents, accessModel);
    }

    useAccountStore.setState({ loading: false });
  });
};

export const login = async (email: string, password: string) => {
  useAccountStore.setState({ loading: true });

  await withIntegration(async (integration) => {
    const user = await integration.login(email, password);

    useAccountStore.setState({ user });
  });

  await restoreFavorites();
  await restoreWatchHistory();

  useAccountStore.setState({ loading: false });
};

export async function logout() {
  await withOptionalIntegration(async (integration) => {
    // this invalidates all entitlements caches which makes the useEntitlement hook to verify the entitlements.
    await queryClient.invalidateQueries('entitlements');

    useAccountStore.setState({
      user: null,
      subscription: null,
      transactions: null,
      activePayment: null,
      customerConsents: null,
      publisherConsents: null,
    });

    await restoreFavorites();
    await restoreWatchHistory();

    await integration.logout();
  });
}

export const register = async (email: string, password: string) => {
  await withIntegration(async (integration) => {
    useAccountStore.setState({ loading: true });

    const user = await integration.register(email, password);

    useAccountStore.setState({ loading: false, user });
  });
};

export const updateConsents = async (customerConsents: CustomerConsent[]): Promise<ServiceResponse<CustomerConsent[]>> => {
  return await useAccount(async ({ customer, auth: { jwt } }) => {
    return await useService(async ({ accountService, config }) => {
      useAccountStore.setState({ loading: true });

      try {
        const response = await accountService?.updateCustomerConsents({
          jwt,
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
  return await useAccount(async ({ customer, auth: { jwt } }) => {
    return await useService(async ({ accountService, config }) => {
      const response = await accountService.getCustomerConsents({ config, customer, jwt });

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
  return await useAccount(async ({ customer, auth: { jwt } }) => {
    return await useService(async ({ accountService, sandbox = true }) => {
      const { responseData } = await accountService.getCaptureStatus({ customer }, sandbox, jwt);

      return responseData;
    });
  });
};

export const updateCaptureAnswers = async (capture: Capture): Promise<Capture> => {
  return await useAccount(async ({ customer, auth, customerConsents }) => {
    return await useService(async ({ accountService, accessModel, sandbox = true }) => {
      const response = await accountService.updateCaptureAnswers({ customer, ...capture }, sandbox, auth.jwt);

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      await afterLogin(auth, response.responseData as Customer, customerConsents, accessModel, false);

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
  return await useAccount(async ({ customerId, auth: { jwt } }) => {
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
        jwt,
      );

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      await reloadActiveSubscription({ delay: 2000 });

      return response?.responseData;
    });
  });
};

export async function checkEntitlements(offerId?: string): Promise<unknown> {
  return await useAccount(async ({ auth: { jwt } }) => {
    return await useService(async ({ checkoutService, sandbox = true }) => {
      if (!checkoutService) throw new Error('checkout service is not configured');
      if (!offerId) {
        return false;
      }
      const { responseData } = await checkoutService.getEntitlements({ offerId }, sandbox, jwt);
      return !!responseData?.accessGranted;
    });
  });
}

export async function reloadActiveSubscription({ delay }: { delay: number } = { delay: 0 }): Promise<unknown> {
  useAccountStore.setState({ loading: true });
  return await useAccount(async ({ customerId, auth: { jwt } }) => {
    return await useService(async ({ subscriptionService, sandbox = true, config }) => {
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
        subscriptionService.getActiveSubscription({ sandbox, customerId, jwt, config }),
        subscriptionService.getAllTransactions({ sandbox, customerId, jwt }),
        subscriptionService.getActivePayment({ sandbox, customerId, jwt }),
      ]);
      // this invalidates all entitlements caches which makes the useEntitlement hook to verify the entitlements.
      await queryClient.invalidateQueries('entitlements');

      useAccountStore.setState({
        subscription: activeSubscription,
        loading: false,
        transactions,
        activePayment,
      });
    });
  });
}

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

async function afterLogin(
  auth: AuthData,
  user: Customer,
  customerConsents: CustomerConsent[] | null,
  accessModel: string,
  shouldSubscriptionReload: boolean = true,
) {
  useAccountStore.setState({
    auth,
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
