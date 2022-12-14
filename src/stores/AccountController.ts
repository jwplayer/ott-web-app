import jwtDecode from 'jwt-decode';

import * as subscriptionService from '#src/services/subscription.service';
import { getPaymentDetails, getTransactions } from '#src/services/subscription.service';
import * as cleengAccountService from '#src/services/cleeng.account.service';
import * as inplayerAccountService from '#src/services/inplayer.account.service';
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
  ServiceResponse,
} from '#types/account';
import { useConfigStore } from '#src/stores/ConfigStore';
import * as persist from '#src/utils/persist';
import { useAccountStore } from '#src/stores/AccountStore';
import { restoreWatchHistory, serializeWatchHistory } from '#src/stores/WatchHistoryController';
import { restoreFavorites, serializeFavorites } from '#src/stores/FavoritesController';
import { getMediaByWatchlist } from '#src/services/api.service';
import { queryClient } from '#src/providers/QueryProvider';
import type { AccessModel, Config } from '#types/Config';

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
  await withAccountService(async ({ accountService, config }) => {
    useAccountStore.setState({
      loading: true,
      canUpdateEmail: accountService.canUpdateEmail,
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
  return await withAccountService(async ({ accountService, sandbox }) => {
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
  try {
    const { config } = useConfigStore.getState();
    const authData = await cleengAccountService.getFreshJwtToken({ config, auth });

    if (authData) {
      useAccountStore.setState((s) => ({ auth: { ...s.auth, ...authData } }));
    }
  } catch (error: unknown) {
    // failed to refresh, logout user
    await logout();
  }
};

export const getAccount = async (auth: AuthData) => {
  await withAccountService(async ({ accountService, config, accessModel }) => {
    const response = await accountService.getUser({ config, auth });

    await afterLogin(auth, response.user, response.customerConsents, accessModel);

    useAccountStore.setState({ loading: false });
  });
};

export const login = async (email: string, password: string) => {
  await withAccountService(async ({ accountService, config, accessModel }) => {
    useAccountStore.setState({ loading: true });

    const response = await accountService.login({ config, email, password });

    await afterLogin(response.auth, response.user, response.customerConsents, accessModel);

    await restoreFavorites();
    await restoreWatchHistory();
    useAccountStore.setState({ loading: false });
  });
};

export const logout = async () => {
  await withAccountService(async ({ accountService }) => {
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
    await accountService.logout();
  });
};

export const register = async (email: string, password: string) => {
  await withAccountService(async ({ accountService, accessModel, config }) => {
    useAccountStore.setState({ loading: true });
    const { auth, user, customerConsents } = await accountService.register({ config, email, password });

    await afterLogin(auth, user, customerConsents, accessModel);

    // @todo statement will be removed once the fav and history are done on InPlayer side
    if (auth.refreshToken) {
      await updatePersonalShelves();
    }
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

    return await cleengAccountService.updateCustomer(
      {
        id: customerId,
        externalData: personalShelfData,
      },
      cleengSandbox,
      jwt,
    );
  });
};

export const updateConsents = async (customerConsents: CustomerConsent[]): Promise<ServiceResponse<CustomerConsent[]>> => {
  return await useAccountContext(async ({ customer, auth: { jwt } }) => {
    return await withAccountService(async ({ accountService, config }) => {
      useAccountStore.setState({ loading: true });

      try {
        const response = await accountService.updateCustomerConsents({
          jwt,
          config,
          customer,
          consents: customerConsents,
        });

        if (response?.consents) {
          useAccountStore.setState({ customerConsents: response.consents });
        }

        return {
          responseData: response.consents,
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
  return await useAccountContext(async ({ customer, auth: { jwt } }) => {
    return await withAccountService(async ({ accountService, config }) => {
      const response = await accountService.getCustomerConsents({ config, customer, jwt });

      if (response?.consents) {
        useAccountStore.setState({ customerConsents: response.consents });
      }

      return response;
    });
  });
}

export const getPublisherConsents = async (): Promise<GetPublisherConsentsResponse> => {
  return await withAccountService(async ({ accountService, config }) => {
    const response = await accountService.getPublisherConsents(config);

    useAccountStore.setState({ publisherConsents: response.consents });

    return response;
  });
};

export const getCaptureStatus = async (): Promise<GetCaptureStatusResponse> => {
  return await useAccountContext(async ({ customer, auth: { jwt } }) => {
    return await withAccountService(async ({ accountService, sandbox }) => {
      const { responseData } = await accountService.getCaptureStatus({ customer }, sandbox, jwt);

      return responseData;
    });
  });
};

export const updateCaptureAnswers = async (capture: Capture): Promise<Capture> => {
  return await useAccountContext(async ({ customer, auth, customerConsents }) => {
    return await withAccountService(async ({ accountService, accessModel, sandbox }) => {
      const response = await accountService.updateCaptureAnswers({ customer, ...capture }, sandbox, auth.jwt);

      if (response.errors.length > 0) throw new Error(response.errors[0]);

      await afterLogin(auth, response.responseData as Customer, customerConsents, accessModel);

      return response.responseData;
    });
  });
};

export const resetPassword = async (email: string, resetUrl: string) => {
  return await withAccountService(async ({ accountService, sandbox, authProviderId }) => {
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
  return await withAccountService(async ({ accountService, sandbox }) => {
    const response = await accountService.changePasswordWithOldPassword({ oldPassword, newPassword, newPasswordConfirmation }, sandbox);
    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
  });
};

export const changePasswordWithToken = async (customerEmail: string, newPassword: string, resetPasswordToken: string, newPasswordConfirmation: string) => {
  return await withAccountService(async ({ accountService, sandbox, authProviderId }) => {
    const response = await accountService.changePasswordWithResetToken(
      { publisherId: authProviderId, customerEmail, newPassword, resetPasswordToken, newPasswordConfirmation },
      sandbox,
    );
    if (response?.errors?.length > 0) throw new Error(response.errors[0]);

    return response?.responseData;
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

async function afterLogin(auth: AuthData, user: Customer, customerConsents: CustomerConsent[] | null, accessModel: string) {
  useAccountStore.setState({
    auth,
    user,
    customerConsents,
  });

  return await Promise.allSettled([accessModel === 'SVOD' ? reloadActiveSubscription() : Promise.resolve(), getPublisherConsents()]);
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

function useAccountContext<T>(
  callback: (args: { customerId: string; customer: Customer; customerConsents: CustomerConsent[] | null; auth: AuthData }) => T,
): T {
  const { user, auth, customerConsents } = useAccountStore.getState();

  if (!user?.id || !auth?.jwt) throw new Error('user not logged in');

  return callback({ customerId: user.id, customer: user, auth, customerConsents });
}

function withAccountService<T>(
  callback: (args: {
    accountService: typeof inplayerAccountService | typeof cleengAccountService;
    config: Config;
    accessModel: AccessModel;
    sandbox: boolean;
    authProviderId: string;
  }) => T,
): T {
  const { config, accessModel } = useConfigStore.getState();
  const { cleeng, inplayer } = config.integrations;

  if (inplayer?.clientId) {
    return callback({
      accountService: inplayerAccountService,
      config,
      accessModel,
      sandbox: !!inplayer.useSandbox,
      authProviderId: inplayer?.clientId?.toString(),
    });
  } else if (cleeng?.id) {
    return callback({ accountService: cleengAccountService, config, accessModel, sandbox: !!cleeng.useSandbox, authProviderId: cleeng?.id });
  }

  throw new Error('No account service available');
}
