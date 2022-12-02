import jwtDecode from 'jwt-decode';

import { post, put, patch, get } from './cleeng.service';

import { getOverrideIP } from '#src/utils/common';
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
  RefreshToken,
  GetLocales,
  GetCaptureStatus,
  UpdateCaptureAnswers,
  LoginPayload,
  AuthData,
  JwtDetails,
  RegisterPayload,
} from '#types/account';
import type { Config } from '#types/Config';

export const setEnvironment = () => true;

export const login: Login = async ({ config, email, password }) => {
  const payload: LoginPayload = {
    email,
    password,
    publisherId: config.integrations.cleeng?.id || '',
    customerIP: getOverrideIP(),
  };

  const { responseData: auth, errors }: ServiceResponse<AuthData> = await post(!!config.integrations.cleeng?.useSandbox, '/auths', JSON.stringify(payload));

  if (errors.length > 0) throw new Error(errors[0]);

  return {
    auth,
    user: await getUser({ config, auth }),
  };
};

export const register: Register = async ({ config, email, password }) => {
  const localesResponse = await getLocales(!!config.integrations.cleeng?.useSandbox);

  if (localesResponse.errors.length > 0) throw new Error(localesResponse.errors[0]);

  const payload: RegisterPayload = {
    email,
    password,
    locale: localesResponse.responseData.locale,
    country: localesResponse.responseData.country,
    currency: localesResponse.responseData.currency,
    publisherId: config.integrations.cleeng?.id || '',
    customerIP: getOverrideIP(),
  };

  const { responseData: auth, errors }: ServiceResponse<AuthData> = await post(!!config.integrations.cleeng?.useSandbox, '/customers', JSON.stringify(payload));

  if (errors.length) throw new Error(errors[0]);

  return {
    auth,
    user: await getUser({ config, auth }),
  };
};

export const logout = async () => true;

export async function getUser({ config, auth }: { config: Config; auth: AuthData }) {
  const decodedToken: JwtDetails = jwtDecode(auth.jwt);
  const customerId = decodedToken.customerId;
  const { responseData: user, errors } = await getCustomer({ customerId }, !!config.integrations.cleeng?.useSandbox, auth.jwt);

  if (errors.length > 0) throw new Error(errors[0]);

  return user;
}

export const getFreshJwtToken = async ({ config, auth }: { config: Config; auth: AuthData }) => {
  const result = await refreshToken({ refreshToken: auth.refreshToken }, !!config.integrations.cleeng?.useSandbox);

  if (result.errors.length) throw new Error(result.errors[0]);

  return result?.responseData;
};

// export const register: Register = async (payload, sandbox) => {
//   payload.customerIP = getOverrideIP();
//   return post(sandbox, '/customers', JSON.stringify(payload));
// };

export const fetchPublisherConsents: GetPublisherConsents = async (payload, sandbox) => {
  return get(sandbox, `/publishers/${payload.publisherId}/consents`);
};

export const fetchCustomerConsents: GetCustomerConsents = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/consents`, jwt);
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
  return get(sandbox, `/customers/${payload.customerId}`, jwt);
};

export const refreshToken: RefreshToken = async (payload, sandbox) => {
  return post(sandbox, '/auths/refresh_token', JSON.stringify(payload));
};

export const getLocales: GetLocales = async (sandbox) => {
  return get(sandbox, `/locales${getOverrideIP() ? '?customerIP=' + getOverrideIP() : ''}`);
};

export const getCaptureStatus: GetCaptureStatus = async ({ customerId }, sandbox, jwt) => {
  return get(sandbox, `/customers/${customerId}/capture/status`, jwt);
};

export const updateCaptureAnswers: UpdateCaptureAnswers = async ({ customerId, ...payload }, sandbox, jwt) => {
  return put(sandbox, `/customers/${customerId}/capture`, JSON.stringify(payload), jwt);
};
