import InPlayer, { Env } from '@inplayer-org/inplayer.js';

import type { AuthData, Customer, Login, Register, UpdateCustomer } from '#types/account';
import { processInplayerAccount, processInPlayerAuth } from '#src/utils/common';
import type { Config } from '#types/Config';

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

export const register: Register = async ({ config, email, password }) => {
  try {
    const { data } = await InPlayer.Account.signUpV2({
      email,
      password,
      passwordConfirmation: password,
      fullName: '',
      type: 'consumer',
      clientId: config.integrations.inplayer?.clientId || '',
      referrer: window.location.href,
    });

    return {
      auth: processInPlayerAuth(data),
      user: processInplayerAccount(data.account),
    };
  } catch {
    throw new Error('Failed to create user.');
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

export const updateCustomer: UpdateCustomer = async (values) => {
  try {
    const response = await InPlayer.Account.updateAccount({
      fullName: `${values.firstName} ${values.lastName}`,
      metadata: {
        first_name: values.firstName as string,
        last_name: values.lastName as string,
      },
    });

    return {
      errors: [],
      // @ts-ignore
      // wrong data type from InPlayer SDK
      responseData: processInplayerAccount(response.data),
    };
  } catch {
    throw new Error('Failed to fetch user data.');
  }
};
