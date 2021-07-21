import { Store } from 'pullstate';
import jwtDecode from 'jwt-decode';

import * as accountService from '../services/account.service';
import type { AuthData, Customer, JwtDetails } from '../../types/account';

import { ConfigStore } from './ConfigStore';

type AccountStore = {
  auth: AuthData | null;
  user: Customer | null;
};

export const AccountStore = new Store<AccountStore>({
  auth: null,
  user: null,
});

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
