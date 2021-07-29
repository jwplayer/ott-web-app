import { Store } from 'pullstate';
import jwtDecode from 'jwt-decode';

import * as accountService from '../services/account.service';
import type { AuthData, Capture, Customer, JwtDetails } from '../../types/account';
import * as persist from '../utils/persist';

import { ConfigStore } from './ConfigStore';

const PERSIST_KEY_ACCOUNT = 'auth';

type AccountStore = {
  auth: AuthData | null;
  user: Customer | null;
};

export const AccountStore = new Store<AccountStore>({
  auth: null,
  user: null,
});

export const initializeAccount = async () => {
  const { config } = ConfigStore.getRawState();
  const storedSession: AuthData | null = persist.getItem(PERSIST_KEY_ACCOUNT) as AuthData | null;
  let refreshTimeout: number;

  AccountStore.subscribe(
    (state) => state.auth,
    (authData) => {
      window.clearTimeout(refreshTimeout);

      if (authData) {
        refreshTimeout = window.setTimeout(() => refreshJwtToken(config.cleengSandbox, authData), 60 * 1000);
      }

      persist.setItem(PERSIST_KEY_ACCOUNT, authData);
    },
  );

  // restore session from localStorage
  if (storedSession) {
    const refreshedAuthData = await getFreshJwtToken(config.cleengSandbox, storedSession);

    if (refreshedAuthData) {
      await afterLogin(config.cleengSandbox, refreshedAuthData);
    }
  }
};

const getFreshJwtToken = async (sandbox: boolean, auth: AuthData) => {
  const result = await accountService.refreshToken({ refreshToken: auth.refreshToken }, sandbox);

  if (result?.responseData) {
    return result.responseData;
  }
};

const refreshJwtToken = async (sandbox: boolean, auth: AuthData) => {
  const authData = await getFreshJwtToken(sandbox, auth);

  if (authData) {
    AccountStore.update((s) => {
      s.auth = { ...s.auth, ...authData };
    });
  }
};

const afterLogin = async (sandbox: boolean, auth: AuthData) => {
  const decodedToken: JwtDetails = jwtDecode(auth.jwt);
  const customerId = decodedToken.customerId.toString();
  const response = await accountService.getCustomer({ customerId }, sandbox, auth.jwt);

  if (response.errors.length) throw new Error(response.errors[0]);

  AccountStore.update((s) => {
    s.auth = auth;
    s.user = response.responseData;
  });
};

export const login = async (email: string, password: string) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');

  const response = await accountService.login({ email, password, publisherId: cleengId }, cleengSandbox);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return afterLogin(cleengSandbox, response.responseData);
};

export const getCaptureStatus = async () => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { auth, user } = AccountStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user not logged in');

  const response = await accountService.getCaptureStatus({ customerId : user.id.toString() }, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response.responseData;
};

export const updateCaptureAnswers = async (capture: Capture) => {
  const {
    config: { cleengId, cleengSandbox },
  } = ConfigStore.getRawState();
  const { auth, user } = AccountStore.getRawState();

  if (!cleengId) throw new Error('cleengId is not configured');
  if (!user || !auth) throw new Error('user not logged in');

  const response = await accountService.updateCaptureAnswers({ customerId : user.id.toString(), ...capture }, cleengSandbox, auth.jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response.responseData;
};
