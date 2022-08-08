import jwtDecode from 'jwt-decode';

import * as subscriptionService from '#src/services/subscription.service';
import { getPaymentDetails, getTransactions } from '#src/services/subscription.service';
import * as accountService from '#src/services/account.service';
import { fetchCustomerConsents, fetchPublisherConsents, updateCustomer } from '#src/services/account.service';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import type { AuthData, Capture, CustomerConsent, JwtDetails } from '#types/account';
import { useConfigStore } from '#src/stores/ConfigStore';
import * as persist from '#src/utils/persist';
import { useAccountStore } from '#src/stores/AccountStore';
import { restoreWatchHistory, serializeWatchHistory } from '#src/stores/WatchHistoryController';
import { restoreFavorites, serializeFavorites } from '#src/stores/FavoritesController';
import { getMediaByWatchlist } from '#src/services/api.service';
import { queryClient } from '#src/providers/QueryProvider';

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
  const { cleengSandbox } = useConfigStore.getState().getCleengData();

  window.clearTimeout(refreshTimeout);

  if (auth && !document.hidden) {
    refreshTimeout = window.setTimeout(() => refreshJwtToken(cleengSandbox, auth), 60 * 5 * 1000);
  }
};

export const handleVisibilityChange = () => {
  if (document.hidden) return window.clearTimeout(refreshTimeout);

  // document is visible again, test if we need to renew the token
  const auth = useAccountStore.getState().auth;
  const { cleengSandbox } = useConfigStore.getState().getCleengData();

  // user is not logged in
  if (!auth) return;

  // refresh the jwt token if needed. This starts the timeout as well after receiving the refreshed tokens.
  if (authNeedsRefresh(auth)) return refreshJwtToken(cleengSandbox, auth);

  // make sure to start the timeout again since we've cleared it when the document was hidden.
  setJwtRefreshTimeout();
};

export const initializeAccount = async () => {
  const { cleengId, cleengSandbox } = useConfigStore.getState().getCleengData();

  if (!cleengId) {
    useAccountStore.getState().setLoading(false);
    return;
  }

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
      const refreshedAuthData = await getFreshJwtToken(cleengSandbox, storedSession);

      if (refreshedAuthData) {
        await afterLogin(cleengSandbox, refreshedAuthData);
        await restoreWatchHistory();
        await restoreFavorites();
      }
    }
  } catch (error: unknown) {
    await logout();
  }

  useAccountStore.setState({ loading: false });
};

export async function updateUser(values: { firstName: string; lastName: string } | { email: string; confirmationPassword: string }) {
  const { auth, user } = useAccountStore.getState();

  if (!auth || !user) throw new Error('no auth');

  const { cleengSandbox } = useConfigStore.getState().getCleengData();

  const response = await updateCustomer({ ...values, id: user.id.toString() }, cleengSandbox, auth.jwt);

  if (!response) {
    return { errors: Array.of('Unknown error') };
  }

  if (response.errors?.length === 0) {
    useAccountStore.setState({ user: response.responseData });
  }

  return response;
}

const getFreshJwtToken = async (sandbox: boolean, auth: AuthData) => {
  const result = await accountService.refreshToken({ refreshToken: auth.refreshToken }, sandbox);

  if (result.errors.length) throw new Error(result.errors[0]);

  return result?.responseData;
};

const refreshJwtToken = async (sandbox: boolean, auth: AuthData) => {
  try {
    const authData = await getFreshJwtToken(sandbox, auth);

    if (authData) {
      useAccountStore.setState((s) => ({ auth: { ...s.auth, ...authData } }));
    }
  } catch (error: unknown) {
    // failed to refresh, logout user
    await logout();
  }
};

export const afterLogin = async (sandbox: boolean, auth: AuthData) => {
  const { accessModel } = useConfigStore.getState();
  const decodedToken: JwtDetails = jwtDecode(auth.jwt);
  const customerId = decodedToken.customerId;
  const response = await accountService.getCustomer({ customerId }, sandbox, auth.jwt);

  if (response.errors.length) throw new Error(response.errors[0]);

  useAccountStore.setState({
    auth: auth,
    user: response.responseData,
  });

  await Promise.allSettled([accessModel === 'SVOD' ? reloadActiveSubscription() : Promise.resolve(), getCustomerConsents(), getPublisherConsents()]);

  useAccountStore.setState({ loading: false });
};

export const login = async (email: string, password: string) => {
  await useConfig(async ({ cleengId, cleengSandbox }) => {
    useAccountStore.setState({ loading: true });

    const response = await accountService.login({ email, password, publisherId: cleengId }, cleengSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await afterLogin(cleengSandbox, response.responseData);

    await restoreFavorites();
    await restoreWatchHistory();
  });
};

export const logout = async () => {
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
};

export const register = async (email: string, password: string) => {
  await useConfig(async ({ cleengId, cleengSandbox }) => {
    const localesResponse = await accountService.getLocales(cleengSandbox);

    if (localesResponse.errors.length > 0) throw new Error(localesResponse.errors[0]);

    const responseRegister = await accountService.register(
      {
        email: email,
        password: password,
        locale: localesResponse.responseData.locale,
        country: localesResponse.responseData.country,
        currency: localesResponse.responseData.currency,
        publisherId: cleengId,
      },
      cleengSandbox,
    );

    if (responseRegister.errors.length) throw new Error(responseRegister.errors[0]);

    await afterLogin(cleengSandbox, responseRegister.responseData);

    await updatePersonalShelves();
  });
};

export const updatePersonalShelves = async () => {
  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const { watchHistory } = useWatchHistoryStore.getState();
    const { favorites } = useFavoritesStore.getState();

    if (!watchHistory && !favorites) return;

    const personalShelfData = {
      history: serializeWatchHistory(watchHistory),
      favorites: serializeFavorites(favorites),
    };

    return await accountService.updateCustomer(
      {
        id: customerId,
        externalData: personalShelfData,
      },
      cleengSandbox,
      jwt,
    );
  });
};

export const updateConsents = async (customerConsents: CustomerConsent[]) => {
  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const response = await accountService.updateCustomerConsents(
      {
        id: customerId,
        consents: customerConsents,
      },
      cleengSandbox,
      jwt,
    );

    await getCustomerConsents();

    return response;
  });
};

export async function getCustomerConsents() {
  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const response = await fetchCustomerConsents({ customerId }, cleengSandbox, jwt);

    if (response && !response.errors?.length) {
      useAccountStore.setState({ customerConsents: response.responseData.consents });
    }

    return response;
  });
}

export async function getPublisherConsents() {
  return await useConfig(async ({ cleengId, cleengSandbox }) => {
    const response = await fetchPublisherConsents({ publisherId: cleengId }, cleengSandbox);

    if (response && !response.errors?.length) {
      useAccountStore.setState({ publisherConsents: response.responseData.consents });
    }

    return response;
  });
}

export const getCaptureStatus = async () => {
  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const response = await accountService.getCaptureStatus({ customerId }, cleengSandbox, jwt);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  });
};

export const updateCaptureAnswers = async (capture: Capture) => {
  return await useLoginContext(async ({ cleengSandbox, customerId, auth }) => {
    const response = await accountService.updateCaptureAnswers({ customerId, ...capture }, cleengSandbox, auth.jwt);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    // @todo why is this needed?
    await afterLogin(cleengSandbox, auth);

    return response.responseData;
  });
};

export const resetPassword = async (email: string, resetUrl: string) => {
  return await useConfig(async ({ cleengId, cleengSandbox }) => {
    const response = await accountService.resetPassword(
      {
        customerEmail: email,
        publisherId: cleengId,
        resetUrl,
      },
      cleengSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  });
};

export const changePassword = async (customerEmail: string, newPassword: string, resetPasswordToken: string) => {
  return await useConfig(async ({ cleengId, cleengSandbox }) => {
    const response = await accountService.changePassword(
      {
        publisherId: cleengId,
        customerEmail,
        newPassword,
        resetPasswordToken,
      },
      cleengSandbox,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    return response.responseData;
  });
};

export const updateSubscription = async (status: 'active' | 'cancelled') => {
  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const { subscription } = useAccountStore.getState();
    if (!subscription) throw new Error('user has no active subscription');

    const response = await subscriptionService.updateSubscription(
      {
        customerId,
        offerId: subscription.offerId,
        status,
      },
      cleengSandbox,
      jwt,
    );

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await reloadActiveSubscription();

    return response.responseData;
  });
};

export async function reloadActiveSubscription({ delay }: { delay: number } = { delay: 0 }) {
  useAccountStore.setState({ loading: true });

  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const [activeSubscription, transactions, activePayment] = await Promise.all([
      getActiveSubscription({ cleengSandbox, customerId, jwt }),
      getAllTransactions({ cleengSandbox, customerId, jwt }),
      getActivePayment({ cleengSandbox, customerId, jwt }),
    ]);

    // The subscription data takes a few seconds to load after it's purchased,
    // so here's a delay mechanism to give it time to process
    if (delay > 0) {
      return new Promise((resolve: (value?: unknown) => void) => {
        window.setTimeout(() => {
          reloadActiveSubscription().finally(resolve);
        }, delay);
      });
    }

    // this invalidates all entitlements caches which makes the useEntitlement hook to verify the entitlements.
    await queryClient.invalidateQueries('entitlements');

    useAccountStore.setState({
      subscription: activeSubscription,
      loading: false,
      transactions,
      activePayment,
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

async function getActiveSubscription({ cleengSandbox, customerId, jwt }: { cleengSandbox: boolean; customerId: string; jwt: string }) {
  const response = await subscriptionService.getSubscriptions({ customerId }, cleengSandbox, jwt);

  if (response.errors.length > 0) return null;

  return response.responseData.items.find((item) => item.status === 'active' || item.status === 'cancelled') || null;
}

async function getAllTransactions({ cleengSandbox, customerId, jwt }: { cleengSandbox: boolean; customerId: string; jwt: string }) {
  const response = await getTransactions({ customerId }, cleengSandbox, jwt);

  if (response.errors.length > 0) return null;

  return response.responseData.items;
}

async function getActivePayment({ cleengSandbox, customerId, jwt }: { cleengSandbox: boolean; customerId: string; jwt: string }) {
  const response = await getPaymentDetails({ customerId }, cleengSandbox, jwt);

  if (response.errors.length > 0) return null;

  return response.responseData.paymentDetails.find((paymentDetails) => paymentDetails.active) || null;
}

function useConfig<T>(callback: (config: { cleengId: string; cleengSandbox: boolean }) => T): T {
  const { cleengSandbox, cleengId } = useConfigStore.getState().getCleengData();

  if (!cleengId) throw new Error('cleengId is not configured');

  return callback({ cleengId, cleengSandbox });
}

function useLoginContext<T>(callback: (args: { cleengId: string; cleengSandbox: boolean; customerId: string; auth: AuthData }) => T): T {
  const { user, auth } = useAccountStore.getState();

  if (!user?.id || !auth?.jwt) throw new Error('user not logged in');

  return useConfig((config) => callback({ ...config, customerId: user.id, auth }));
}
