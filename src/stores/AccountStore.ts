import { Store } from 'pullstate';
import jwtDecode from 'jwt-decode';

import * as accountService from '../services/account.service';
import * as subscriptionService from '../services/subscription.service';
import type { AuthData, Capture, Customer, JwtDetails, CustomerConsent, Consent } from '../../types/account';
import * as persist from '../utils/persist';
import type { PaymentDetail, Subscription, Transaction } from '../../types/subscription';
import { fetchCustomerConsents, fetchPublisherConsents, updateCustomer } from '../services/account.service';
import { getPaymentDetails, getTransactions } from '../services/subscription.service';

import { ConfigStore } from './ConfigStore';
import { watchHistoryStore, restoreWatchHistory, serializeWatchHistory } from './WatchHistoryStore';
import { favoritesStore, restoreFavorites, serializeFavorites } from './FavoritesStore';

const PERSIST_KEY_ACCOUNT = 'auth';

type AccountStore = {
  loading: boolean;
  auth: AuthData | null;
  user: Customer | null;
  subscription: Subscription | null;
  transactions: Transaction[] | null;
  activePayment: PaymentDetail | null;
  customerConsents: CustomerConsent[] | null;
  publisherConsents: Consent[] | null;
};

export const AccountStore = new Store<AccountStore>({
  loading: true,
  auth: null,
  user: null,
  subscription: null,
  transactions: null,
  activePayment: null,
  customerConsents: null,
  publisherConsents: null,
});

const setLoading = (loading: boolean) => {
  return AccountStore.update((s) => {
    s.loading = loading;
  });
};

let subscription: undefined | (() => void);
let refreshTimeout: number;

export const initializeAccount = async () => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();

  if (!cleengId) {
    setLoading(false);
    return;
  }

  const storedSession: AuthData | null = persist.getItem(PERSIST_KEY_ACCOUNT) as AuthData | null;

  // clear previous subscribe (for dev environment only)
  if (subscription) {
    subscription();
  }

  subscription = AccountStore.subscribe(
    (state) => state.auth,
    (authData) => {
      window.clearTimeout(refreshTimeout);

      if (authData) {
        refreshTimeout = window.setTimeout(() => refreshJwtToken(cleengSandbox, authData), 60 * 1000);
      }

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

  setLoading(false);
};

export async function updateUser(values: { firstName: string; lastName: string } | { email: string; confirmationPassword: string }) {
  const { auth, user } = AccountStore.getRawState();

  if (!auth || !user) throw new Error('no auth');

  const {
    config: { cleengSandbox },
  } = ConfigStore.getRawState();

  const response = await updateCustomer({ ...values, id: user.id.toString() }, cleengSandbox, auth.jwt);

  if (!response) {
    return { errors: Array.of('Unknown error') };
  }

  if (response.errors?.length === 0) {
    AccountStore.update((s) => {
      s.user = response.responseData;
    });
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
      AccountStore.update((s) => {
        s.auth = { ...s.auth, ...authData };
      });
    }
  } catch (error: unknown) {
    // failed to refresh, logout user
    await logout();
  }
};

export const afterLogin = async (sandbox: boolean, auth: AuthData) => {
  const { accessModel } = ConfigStore.getRawState();
  const decodedToken: JwtDetails = jwtDecode(auth.jwt);
  const customerId = decodedToken.customerId;
  const response = await accountService.getCustomer({ customerId }, sandbox, auth.jwt);

  if (response.errors.length) throw new Error(response.errors[0]);

  AccountStore.update((s) => {
    s.auth = auth;
    s.user = response.responseData;
  });

  if (accessModel === 'SVOD') {
    await reloadActiveSubscription();
  }

  await getCustomerConsents();
  await getPublisherConsents();

  AccountStore.update((s) => {
    s.loading = false;
  });
};

export const login = async (email: string, password: string) => {
  await useConfig(async ({ cleengId, cleengSandbox }) => {
    setLoading(true);

    const response = await accountService.login({ email, password, publisherId: cleengId }, cleengSandbox);

    if (response.errors.length > 0) throw new Error(response.errors[0]);

    await afterLogin(cleengSandbox, response.responseData);

    await restoreFavorites();
    await restoreWatchHistory();
  });
};

export const logout = async () => {
  persist.removeItem(PERSIST_KEY_ACCOUNT);

  AccountStore.update((s) => {
    s.auth = null;
    s.user = null;
    s.customerConsents = null;
    s.publisherConsents = null;
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

    updatePersonalShelves();
  });
};

export const updatePersonalShelves = async () => {
  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const { watchHistory } = watchHistoryStore.getRawState();
    const { favorites } = favoritesStore.getRawState();

    if (!watchHistory && !favorites) return;

    const personalShelfData = { history: serializeWatchHistory(watchHistory), favorites: serializeFavorites(favorites) };

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
    const response = await accountService.updateCustomerConsents({ id: customerId, consents: customerConsents }, cleengSandbox, jwt);

    await getCustomerConsents();

    return response;
  });
};

export async function getCustomerConsents() {
  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const response = await fetchCustomerConsents({ customerId }, cleengSandbox, jwt);

    if (response && !response.errors?.length) {
      AccountStore.update((s) => {
        s.customerConsents = response.responseData.consents;
      });
    }

    return response;
  });
}

export async function getPublisherConsents() {
  return await useConfig(async ({ cleengId, cleengSandbox }) => {
    const response = await fetchPublisherConsents({ publisherId: cleengId }, cleengSandbox);

    if (response && !response.errors?.length) {
      AccountStore.update((s) => {
        s.publisherConsents = response.responseData.consents;
      });
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
    const { subscription } = AccountStore.getRawState();
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
  AccountStore.update((s) => {
    s.loading = true;
  });

  return await useLoginContext(async ({ cleengSandbox, customerId, auth: { jwt } }) => {
    const activeSubscription = await getActiveSubscription({ cleengSandbox, customerId, jwt });
    const transactions = await getAllTransactions({ cleengSandbox, customerId, jwt });
    const activePayment = await getActivePayment({ cleengSandbox, customerId, jwt });

    // The subscription data takes a few seconds to load after it's purchased,
    // so here's a delay mechanism to give it time to process
    if (delay > 0) {
      window.setTimeout(() => reloadActiveSubscription(), delay);
    } else {
      AccountStore.update((s) => {
        s.subscription = activeSubscription;
        s.transactions = transactions;
        s.activePayment = activePayment;
        s.loading = false;
      });
    }
  });
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
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');

  return callback({ cleengId, cleengSandbox });
}

function useLoginContext<T>(callback: (args: { cleengId: string; cleengSandbox: boolean; customerId: string; auth: AuthData }) => T): T {
  const { user, auth } = AccountStore.getRawState();

  if (!user?.id || !auth?.jwt) throw new Error('user not logged in');

  return useConfig((config) => callback({ ...config, customerId: user.id, auth }));
}
