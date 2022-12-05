import InPlayer, { AccountData, Env } from '@inplayer-org/inplayer.js';

import type { AuthData, ChangePassword, Customer, Login, ResetPassword } from '#types/account';
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

export const resetPassword: ResetPassword = async ({ customerEmail, publisherId }) => {
  try {
    await InPlayer.Account.requestNewPassword({
      email: customerEmail,
      merchantUuid: publisherId || '',
      brandingId: 0,
    });
  } catch {
    throw new Error('Failed to reset password.');
  }
};

export const changePassword: ChangePassword = async ({
  resetPasswordToken,
  oldPassword = '',
  newPassword: password,
  newPasswordConfirmation: passwordConfirmation = '',
}) => {
  try {
    if (resetPasswordToken) {
      await changePasswordWithResetToken(resetPasswordToken, password, passwordConfirmation);
    } else {
      await changePasswordWithOldPassword(oldPassword, password, passwordConfirmation);
    }
  } catch {
    throw new Error('Failed to change password.');
  }
};
const changePasswordWithResetToken = async (token: string, password: string, passwordConfirmation: string) => {
  await InPlayer.Account.setNewPassword(
    {
      password: password,
      passwordConfirmation: passwordConfirmation,
      brandingId: 0,
    },
    token,
  );
};
const changePasswordWithOldPassword = async (oldPassword: string, password: string, passwordConfirmation: string) => {
  await InPlayer.Account.changePassword({
    oldPassword,
    password,
    passwordConfirmation,
  });
};
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
