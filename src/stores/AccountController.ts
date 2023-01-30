import jwtDecode from 'jwt-decode';

import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type {
  AuthData,
  Capture,
  Customer,
  CustomerConsent,
  GetCaptureStatusResponse,
  GetCustomerConsentsResponse,
  GetPublisherConsentsResponse,
  JwtDetails,
} from '#types/account';
import { useConfigStore } from '#src/stores/ConfigStore';
import * as persist from '#src/utils/persist';
import { useAccountStore } from '#src/stores/AccountStore';
import { restoreWatchHistory, serializeWatchHistory } from '#src/stores/WatchHistoryController';
import { restoreFavorites, serializeFavorites } from '#src/stores/FavoritesController';
import { getMediaByWatchlist } from '#src/services/api.service';
import { queryClient } from '#src/containers/QueryProvider/QueryProvider';
import useService from '#src/hooks/useService';
import useAccount from '#src/hooks/useAccount';

const PERSIST_KEY_ACCOUNT = 'auth';

let subscription: undefined | (() => void);
let refreshTimeout: number;

export const authNeedsRefresh = (auth: AuthData): boolean => {
  const decodedToken: JwtDetails = jwtDecode(auth.jwt);
  const expiresIn = decodedToken.exp * 1000 - Date.now();

  // returns true if token expires in 5 minutes or less
  return expiresIn < 5 * 60 * 1000;
};

export const setJwtRefreshTimeout = () => {
  const auth = useAccountStore.getState().auth;

  // if inplayer integration, skip code below
  if (!auth?.refreshToken) return;

  window.clearTimeout(refreshTimeout);

  if (auth && !document.hidden) {
    refreshTimeout = window.setTimeout(() => refreshJwtToken(auth), 60 * 5 * 1000);
  }
};

export const handleVisibilityChange = () => {
  if (document.hidden) return window.clearTimeout(refreshTimeout);

  // document is visible again, test if we need to renew the token
  const auth = useAccountStore.getState().auth;

  // user is not logged in / if inplayer integration, skip code below
  if (!auth || !auth?.refreshToken) return;

  // refresh the jwt token if needed. This starts the timeout as well after receiving the refreshed tokens.
  if (authNeedsRefresh(auth)) return refreshJwtToken(auth);

  // make sure to start the timeout again since we've cleared it when the document was hidden.
  setJwtRefreshTimeout();
};

export const initializeAccount = async () => {
  await useService(async ({ accountService, config }) => {
    useAccountStore.setState({
      loading: true,
      canUpdateEmail: accountService.canUpdateEmail,
      canRenewSubscription: accountService.canRenewSubscription,
      canChangePasswordWithOldPassword: accountService.canChangePasswordWithOldPassword,
    });
    accountService.setEnvironment(config);

    const storedSession: AuthData | null = persist.getItem(PERSIST_KEY_ACCOUNT) as AuthData | null;

    // clear previous subscribe (for dev environment only)
    if (subscription) {
      subscription();
    }

    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    subscription = useAccountStore.subscribe(
      (state) => state.auth,
      (authData) => {
        setJwtRefreshTimeout();
        persist.setItem(PERSIST_KEY_ACCOUNT, authData);
      },
    );

    // restore session from localStorage
    try {
      if (storedSession) {
        const refreshedAuthData = await accountService.getFreshJwtToken({ config, auth: storedSession });
        if (refreshedAuthData) {
          await getAccount(refreshedAuthData);
          await restoreWatchHistory();
          await restoreFavorites();
        }
      }
    } catch (error: unknown) {
      await logout();
    }

    useAccountStore.setState({ loading: false });
  });
};

export async function updateUser(
  values: { firstName: string; lastName: string } | { email: string; confirmationPassword: string },
): Promise<ServiceResponse<Customer>> {
  return await useService(async ({ accountService, sandbox = true }) => {
    useAccountStore.setState({ loading: true });

    const { auth, user, canUpdateEmail } = useAccountStore.getState();

    if (Object.prototype.hasOwnProperty.call(values, 'email') && !canUpdateEmail) {
      throw new Error('Email update not supported');
    }

    if (!auth || !user) {
      throw new Error('no auth');
    }

    const response = await accountService.updateCustomer({ ...values, id: user.id.toString() }, sandbox, auth.jwt);

    if (!response) {
      throw new Error('Unknown error');
    }

    if (response.errors?.length === 0) {
      useAccountStore.setState({ user: response.responseData });
    }

    return response;
  });
}

export const refreshJwtToken = async (auth: AuthData) => {
  await useService(async ({ accountService }) => {
    try {
      const { config } = useConfigStore.getState();
      const authData = await accountService.getFreshJwtToken({ config, auth });

      if (authData) {
        useAccountStore.setState((s) => ({ auth: { ...s.auth, ...authData } }));
      }
    } catch (error: unknown) {
      // failed to refresh, logout user
      await logout();
    }
  });
};

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
  await useService(async ({ accountService, config, accessModel }) => {
    useAccountStore.setState({ loading: true });

    const response = await accountService.login({ config, email, password });
    if (response) {
      await afterLogin(response.auth, response.user, response.customerConsents, accessModel);

      await restoreFavorites();
      await restoreWatchHistory();
    }

    useAccountStore.setState({ loading: false });
  });
};

export async function logout() {
  if (!useAccountStore.getState().auth) return;

  await useService(async ({ accountService }) => {
    persist.removeItem(PERSIST_KEY_ACCOUNT);

    // this invalidates all entitlements caches which makes the useEntitlement hook to verify the entitlements.
    await queryClient.invalidateQueries('entitlements');

    useAccountStore.setState({
      auth: null,
      user: null,
      subscription: null,
      transactions: null,
      activePayment: null,
      customerConsents: null,
      publisherConsents: null,
    });

    await restoreFavorites();
    await restoreWatchHistory();

    // it's needed for the InPlayer SDK
    await accountService?.logout();
  });
}

export const register = async (email: string, password: string) => {
  await useService(async ({ accountService, accessModel, config }) => {
    useAccountStore.setState({ loading: true });
    const response = await accountService.register({ config, email, password });
    if (response) {
      const { auth, user, customerConsents } = response;
      await afterLogin(auth, user, customerConsents, accessModel, false);
    }

    await updatePersonalShelves();
  });
};

export const updatePersonalShelves = async () => {
  await useAccount(async ({ customer, auth: { jwt } }) => {
    await useService(async ({ accountService, sandbox = true }) => {
      const { watchHistory } = useWatchHistoryStore.getState();
      const { favorites } = useFavoritesStore.getState();
      if (!watchHistory && !favorites) return;

      const personalShelfData = {
        history: serializeWatchHistory(watchHistory),
        favorites: serializeFavorites(favorites),
      };

      return await accountService?.updatePersonalShelves(
        {
          id: customer.id,
          externalData: personalShelfData,
        },
        sandbox,
        jwt,
      );
    });
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
    const response = await accountService.changePasswordWithOldPassword({ oldPassword, newPassword, newPasswordConfirmation }, sandbox);
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
