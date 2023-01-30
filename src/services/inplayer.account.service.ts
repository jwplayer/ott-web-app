import InPlayer, { AccountData, Env, GetRegisterField, UpdateAccountData, FavoritesData, WatchHistory } from '@inplayer-org/inplayer.js';

import type {
  AuthData,
  Capture,
  ChangePassword,
  ChangePasswordWithOldPassword,
  Consent,
  Customer,
  CustomerConsent,
  ExternalData,
  GetCaptureStatus,
  GetCustomerConsents,
  GetCustomerConsentsResponse,
  GetPublisherConsents,
  Login,
  Register,
  ResetPassword,
  UpdateCaptureAnswers,
  UpdateCustomer,
  UpdateCustomerArgs,
  UpdateCustomerConsents,
  UpdatePersonalShelves,
} from '#types/account';
import type { Config } from '#types/Config';
import type { InPlayerAuthData, InPlayerError } from '#types/inplayer';
import type { Favorite } from '#types/favorite';
import type { WatchHistoryItem } from '#types/watchHistory';

enum InPlayerEnv {
  Development = 'development',
  Production = 'production',
  Daily = 'daily',
}

export const setEnvironment = (config: Config) => {
  const env: string = config.integrations?.inplayer?.useSandbox ? InPlayerEnv.Daily : InPlayerEnv.Production;
  InPlayer.setConfig(env as Env);
};

export const login: Login = async ({ config, email, password }) => {
  try {
    const { data } = await InPlayer.Account.signInV2({
      email,
      password,
      clientId: config.integrations.inplayer?.clientId || '',
      referrer: window.location.href,
    });

    const user = formatAccount(data.account);
    user.externalData = await getCustomerExternalData();

    return {
      auth: formatAuth(data),
      user,
      customerConsents: parseJson(user?.metadata?.consents as string, []),
    };
  } catch {
    throw new Error('Failed to authenticate user.');
  }
};

export const register: Register = async ({ config, email, password }) => {
  try {
    const { data } = await InPlayer.Account.signUpV2({
      email,
      password,
      passwordConfirmation: password,
      fullName: email,
      type: 'consumer',
      clientId: config.integrations.inplayer?.clientId || '',
      referrer: window.location.href,
    });

    const user = formatAccount(data.account);
    user.externalData = await getCustomerExternalData();

    return {
      auth: formatAuth(data),
      user,
      customerConsents: parseJson(user?.metadata?.consents as string, []),
    };
  } catch (error: unknown) {
    const { response } = error as InPlayerError;
    throw new Error(response.data.message);
  }
};

export const logout = async () => {
  try {
    await InPlayer.Account.signOut();
    return InPlayer.Notifications.unsubscribe();
  } catch {
    throw new Error('Failed to sign out.');
  }
};

export const getUser = async () => {
  try {
    const { data } = await InPlayer.Account.getAccountInfo();

    const user = formatAccount(data);
    user.externalData = await getCustomerExternalData();

    return {
      user,
      customerConsents: parseJson(user?.metadata?.consents as string, []) as CustomerConsent[],
    };
  } catch {
    throw new Error('Failed to fetch user data.');
  }
};

export const getFreshJwtToken = async ({ auth }: { auth: AuthData }) => auth;

export const updateCustomer: UpdateCustomer = async (customer) => {
  try {
    const response = await InPlayer.Account.updateAccount(formatUpdateAccount(customer));

    return {
      errors: [],
      responseData: formatAccount(response.data),
    };
  } catch {
    throw new Error('Failed to update user data.');
  }
};

export const getPublisherConsents: GetPublisherConsents = async (config) => {
  try {
    const { inplayer } = config.integrations;
    const { data } = await InPlayer.Account.getRegisterFields(inplayer?.clientId || '');

    // @ts-ignore
    // wrong data type from InPlayer SDK (will be updated in the SDK)
    const result: Consent[] = data?.collection
      .filter((field: GetRegisterField) => field.type === 'checkbox')
      .map((consent: GetRegisterField) => formatPublisherConsents(consent));

    return {
      consents: [getTermsConsent(), ...result],
    };
  } catch {
    throw new Error('Failed to fetch publisher consents.');
  }
};

export const getCustomerConsents: GetCustomerConsents = async (payload) => {
  try {
    if (!payload?.customer) {
      return {
        consents: [],
      };
    }

    const { customer } = payload;
    const consents: GetCustomerConsentsResponse = parseJson(customer.metadata?.consents as string, []);

    return consents;
  } catch {
    throw new Error('Unable to fetch Customer consents.');
  }
};

export const updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
  try {
    const { customer, consents } = payload;
    const params = { ...formatUpdateAccount(customer), ...{ metadata: { consents: JSON.stringify(consents) } } };

    const { data } = await InPlayer.Account.updateAccount(params);

    return {
      consents: parseJson(data?.metadata?.consents as string, []),
    };
  } catch {
    throw new Error('Unable to update Customer consents');
  }
};

export const getCaptureStatus: GetCaptureStatus = async ({ customer }) => {
  return {
    errors: [],
    responseData: {
      isCaptureEnabled: true,
      shouldCaptureBeDisplayed: true,
      settings: [
        {
          answer: {
            firstName: customer.firstName || null,
            lastName: customer.lastName || null,
          },
          enabled: true,
          key: 'firstNameLastName',
          required: true,
        },
      ],
    },
  };
};

export const updateCaptureAnswers: UpdateCaptureAnswers = async ({ ...metadata }) => {
  return (await updateCustomer(metadata, true, '')) as ServiceResponse<Capture>;
};

export const changePasswordWithOldPassword: ChangePasswordWithOldPassword = async (payload) => {
  const { oldPassword, newPassword, newPasswordConfirmation } = payload;
  try {
    await InPlayer.Account.changePassword({
      oldPassword,
      password: newPassword,
      passwordConfirmation: newPasswordConfirmation,
    });
    return {
      errors: [],
      responseData: {},
    };
  } catch {
    throw new Error('Failed to change password.');
  }
};

export const changePasswordWithResetToken: ChangePassword = async (payload) => {
  const { resetPasswordToken = '', newPassword, newPasswordConfirmation = '' } = payload;
  try {
    await InPlayer.Account.setNewPassword(
      {
        password: newPassword,
        passwordConfirmation: newPasswordConfirmation,
        brandingId: 0,
      },
      resetPasswordToken,
    );
    return {
      errors: [],
      responseData: {},
    };
  } catch {
    throw new Error('Failed to change password.');
  }
};

export const resetPassword: ResetPassword = async ({ customerEmail, publisherId }) => {
  try {
    await InPlayer.Account.requestNewPassword({
      email: customerEmail,
      merchantUuid: publisherId || '',
      brandingId: 0,
    });
    return {
      errors: [],
      responseData: {},
    };
  } catch {
    throw new Error('Failed to reset password.');
  }
};

export const subscribeToNotifications = async (uuid: string = '', onMessage: (payload: string) => void) => {
  try {
    if (!InPlayer.Notifications.isSubscribed()) {
      InPlayer.subscribe(uuid, {
        onMessage: onMessage,
        onOpen: () => true,
      });
    }
    return true;
  } catch {
    return false;
  }
};

export const updatePersonalShelves: UpdatePersonalShelves = async (payload) => {
  const { favorites, history } = payload.externalData;
  const externalData = await getCustomerExternalData();
  const currentFavoriteIds = externalData?.favorites?.map((e) => e.mediaid);
  const payloadFavoriteIds = favorites?.map((e) => e.mediaid);

  try {
    history.forEach(async (history) => {
      if (externalData?.history?.length) {
        externalData?.history?.forEach(async (historyStore) => {
          if (historyStore.mediaid === history.mediaid && historyStore.progress !== history.progress) {
            await InPlayer.Account.updateWatchHistory(history.mediaid, history.progress);
          }
        });
      } else {
        await InPlayer.Account.updateWatchHistory(history.mediaid, history.progress);
      }
    });

    if (payloadFavoriteIds.length > (currentFavoriteIds?.length || 0)) {
      payloadFavoriteIds.forEach(async (mediaId) => {
        if (!currentFavoriteIds?.includes(mediaId)) {
          await InPlayer.Account.addToFavorites(mediaId);
        }
      });
    } else {
      currentFavoriteIds?.forEach(async (mediaid) => {
        if (!payloadFavoriteIds?.includes(mediaid)) {
          await InPlayer.Account.deleteFromFavorites(mediaid);
        }
      });
    }

    return {
      errors: [],
      responseData: {},
    };
  } catch {
    throw new Error('Failed to update external data');
  }
};

const getCustomerExternalData = async (): Promise<ExternalData> => {
  const [favoritesData, historyData] = await Promise.all([InPlayer.Account.getFavorites(), await InPlayer.Account.getWatchHistory({})]);

  const favorites = favoritesData.data?.collection?.map((favorite: FavoritesData) => {
    return formatFavorite(favorite);
  });

  const history = historyData.data?.collection?.map((history: WatchHistory) => {
    return formatHistoryItem(history);
  });

  return {
    favorites,
    history,
  };
};

const formatFavorite = (favorite: FavoritesData): Favorite => {
  return {
    mediaid: favorite.media_id,
  } as Favorite;
};

const formatHistoryItem = (history: WatchHistory): WatchHistoryItem => {
  return {
    mediaid: history.media_id,
    progress: history.progress,
  } as WatchHistoryItem;
};

function formatAccount(account: AccountData): Customer {
  const { id, uuid, email, full_name: fullName, metadata, created_at: createdAt } = account;
  const regDate = new Date(createdAt * 1000).toLocaleString();

  let firstName = metadata?.first_name as string;
  let lastName = metadata?.surname as string;
  if (!firstName && !lastName) {
    const nameParts = fullName.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1)?.join(' ');
  }
  return {
    id: id.toString(),
    uuid,
    email,
    fullName,
    firstName,
    lastName,
    metadata,
    regDate,
    country: '',
    lastUserIp: '',
  };
}

function formatUpdateAccount(customer: UpdateCustomerArgs) {
  const firstName = customer.firstName?.trim() || '';
  const lastName = customer.lastName?.trim() || '';
  const fullName = `${firstName} ${lastName}`;

  const data: UpdateAccountData = {
    fullName,
    metadata: {
      first_name: firstName,
      surname: lastName,
    },
  };

  return data;
}

function formatAuth(auth: InPlayerAuthData): AuthData {
  const { access_token: jwt } = auth;
  return {
    jwt,
    customerToken: '',
    refreshToken: '',
  };
}

function formatPublisherConsents(consent: Partial<GetRegisterField>) {
  return {
    broadcasterId: 0,
    enabledByDefault: false,
    label: consent.label,
    name: consent.name,
    required: consent.required,
    value: '',
    version: '1',
  } as Consent;
}

function getTermsConsent(): Consent {
  const label = 'I accept the <a href="https://inplayer.com/legal/terms" target="_blank">Terms and Conditions</a> of InPlayer.';
  return formatPublisherConsents({
    required: true,
    name: 'terms',
    label,
  });
}

function parseJson(value: string, fallback = {}) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export const canUpdateEmail = false;

export const canChangePasswordWithOldPassword = true;

export const canRenewSubscription = false;
