import InPlayer, { AccountData, Env } from '@inplayer-org/inplayer.js';

import type { AuthData, Customer, Login } from '#types/account';
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
      auth: processInPlayerAuth(data),
      user: processInplayerAccount(data.account),
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
    return processInplayerAccount(data);
  } catch {
    throw new Error('Failed to fetch user data.');
  }
};

export const getFreshJwtToken = async ({ auth }: { auth: AuthData }) => auth;

// responsible to convert the InPlayer object to be compatible to the store
function processInplayerAccount(account: AccountData): Customer {
  const { id, email, full_name: fullName, metadata, created_at: createdAt } = account;
  const regDate = new Date(createdAt * 1000).toLocaleString();

  return {
    id: id.toString(),
    email,
    fullName,
    firstName: metadata?.first_name as string,
    lastName: metadata?.last_name as string,
    regDate,
    country: '',
    lastUserIp: '',
  };
}

function processInPlayerAuth(auth: InPlayerAuthData): AuthData {
  const { access_token: jwt } = auth;
  return {
    jwt,
    customerToken: '',
    refreshToken: '',
  };
}
