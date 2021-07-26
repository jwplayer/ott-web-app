import type {
  ChangePassword,
  GetCustomer,
  GetCustomerConsents,
  GetPublisherConsents,
  Login,
  Register,
  ResetPassword,
  UpdateCustomer,
  UpdateCustomerConsents,
  RefreshToken, GetLocales,
} from '../../types/account';

import { post, put, patch, get } from './cleeng.service';

export const login: Login = async (payload, sandbox) => {
  return post(sandbox, '/auths', JSON.stringify(payload));
};

export const register: Register = async (payload, sandbox) => {
  return post(sandbox, '/auths', JSON.stringify(payload));
};

export const getPublisherConsents: GetPublisherConsents = async (payload, sandbox) => {
  return get(sandbox, `/publishers/${payload.publisherId}/consents`);
};

export const getCustomerConsents: GetCustomerConsents = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/consents`, undefined, jwt);
};

export const resetPassword: ResetPassword = async (payload, sandbox) => {
  return put(sandbox, '/customers/passwords', JSON.stringify(payload));
};

export const changePassword: ChangePassword = async (payload, sandbox) => {
  return patch(sandbox, '/customers/passwords', JSON.stringify(payload));
};

export const updateCustomer: UpdateCustomer = async (payload, sandbox, jwt) => {
  return patch(sandbox, `/customers/${payload.id}`, JSON.stringify(payload), jwt);
};

export const updateCustomerConsents: UpdateCustomerConsents = async (payload, sandbox, jwt) => {
  return put(sandbox, `/customers/${payload.id}/consents`, JSON.stringify(payload), jwt);
};

export const getCustomer: GetCustomer = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}`, undefined, jwt);
};

export const refreshToken: RefreshToken = async (payload, sandbox) => {
  return post(sandbox, '/auths/refresh_token', JSON.stringify(payload));
};

export const getLocales: GetLocales = async (sandbox) => {
  return get(sandbox, '/locales');
};
