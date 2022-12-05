import InPlayer, { AccountData, Env } from '@inplayer-org/inplayer.js';

import type { AuthData, Customer, Login, UpdateCustomer } from '#types/account';
import type { Config } from '#types/Config';
import type { InPlayerAuthData } from '#types/inplayer';

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

    return {
      auth: processAuth(data),
      user: processAccount(data.account),
    };
  } catch {
    throw new Error('Failed to authenticate user.');
  }
};

export const logout = async () => {
  try {
    InPlayer.Account.signOut();
  } catch {
    throw new Error('Failed to sign out.');
  }
};

export const getUser = async (): Promise<Customer> => {
  try {
    const { data } = await InPlayer.Account.getAccountInfo();
    return processAccount(data);
  } catch {
    throw new Error('Failed to fetch user data.');
  }
};

export const getFreshJwtToken = async ({ auth }: { auth: AuthData }) => auth;

export const updateCustomer: UpdateCustomer = async (values) => {
  try {
    const fullName = `${values.firstName} ${values.lastName}`;
    const response = await InPlayer.Account.updateAccount({
      fullName,
      metadata: {
        ...(values?.consents && { consents: JSON.stringify(values.consents) }),
      },
    });

    return {
      errors: [],
      // @ts-ignore
      // wrong data type from InPlayer SDK (will be updated in the SDK)
      responseData: processAccount(response.data),
    };
  } catch {
    throw new Error('Failed to update user data.');
  }
};

// responsible to convert the InPlayer object to be compatible to the store
function processAccount(account: AccountData): Customer {
  const { id, email, full_name: fullName, created_at: createdAt } = account;
  const regDate = new Date(createdAt * 1000).toLocaleString();
  const nameParts = fullName.split(' ');

  return {
    id: id.toString(),
    email,
    fullName,
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' '),
    regDate,
    country: '',
    lastUserIp: '',
  };
}

function processAuth(auth: InPlayerAuthData): AuthData {
  const { access_token: jwt } = auth;
  return {
    jwt,
    customerToken: '',
    refreshToken: '',
  };
}
