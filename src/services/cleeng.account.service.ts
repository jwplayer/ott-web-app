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
  GetCustomerConsentsResponse,
  GetCaptureStatusResponse,
  Capture,
  UpdateCustomerConsentsPayload,
  UpdateCustomerPayload,
  UpdateCaptureAnswersPayload,
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

  const { user, customerConsents } = await getUser({ config, auth });

  return {
    auth,
    user,
    customerConsents,
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

  const { user, customerConsents } = await getUser({ config, auth });

  return {
    auth,
    user,
    customerConsents,
  };
};

export const logout = async () => true;

export async function getUser({ config, auth }: { config: Config; auth: AuthData }) {
  const decodedToken: JwtDetails = jwtDecode(auth.jwt);
  const customerId = decodedToken.customerId;
  const { responseData: user, errors } = await getCustomer({ customerId }, !!config.integrations.cleeng?.useSandbox, auth.jwt);

  if (errors.length > 0) throw new Error(errors[0]);

  const consentsPayload = {
    config,
    jwt: auth.jwt,
    customer: user,
  };

  const { consents } = await getCustomerConsents(consentsPayload);

  return {
    user,
    customerConsents: consents,
  };
}

export const getFreshJwtToken = async ({ config, auth }: { config: Config; auth: AuthData }) => {
  const response = await refreshToken({ refreshToken: auth.refreshToken }, !!config.integrations.cleeng?.useSandbox);

  if (response.errors.length) throw new Error(response.errors[0]);

  return response?.responseData;
};

export const getPublisherConsents: GetPublisherConsents = async (config) => {
  const { cleeng } = config.integrations;
  const response = await get(!!cleeng?.useSandbox, `/publishers/${cleeng?.id}/consents`);

  if (response.errors.length) throw new Error(response.errors[0]);

  return {
    consents: response?.responseData?.consents || [],
  };
};

export const getCustomerConsents: GetCustomerConsents = async (payload) => {
  const { config, customer, jwt } = payload;
  const { cleeng } = config.integrations;

  const response: ServiceResponse<GetCustomerConsentsResponse> = await get(!!cleeng?.useSandbox, `/customers/${customer?.id}/consents`, jwt);
  if (response.errors.length) throw new Error(response.errors[0]);

  return {
    consents: response?.responseData?.consents || [],
  };
};

export const updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
  const { config, customer, jwt } = payload;
  const { cleeng } = config.integrations;

  const params: UpdateCustomerConsentsPayload = {
    id: customer.id,
    consents: payload.consents,
  };

  const response: ServiceResponse<never> = await put(!!cleeng?.useSandbox, `/customers/${customer?.id}/consents`, JSON.stringify(params), jwt);
  if (response.errors.length) throw new Error(response.errors[0]);

  return await getCustomerConsents(payload);
};

export const getCaptureStatus: GetCaptureStatus = async ({ customer }, sandbox, jwt) => {
  const response: ServiceResponse<GetCaptureStatusResponse> = await get(sandbox, `/customers/${customer?.id}/capture/status`, jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response;
};

export const updateCaptureAnswers: UpdateCaptureAnswers = async ({ customer, ...payload }, sandbox, jwt) => {
  const params: UpdateCaptureAnswersPayload = {
    customerId: customer.id,
    ...payload,
  };

  const response: ServiceResponse<Capture> = await put(sandbox, `/customers/${customer.id}/capture`, JSON.stringify(params), jwt);

  if (response.errors.length > 0) throw new Error(response.errors[0]);

  return response;
};

export const resetPassword: ResetPassword = async (payload, sandbox) => {
  return put(sandbox, '/customers/passwords', JSON.stringify(payload));
};

export const changePassword: ChangePassword = async (payload, sandbox) => {
  return patch(sandbox, '/customers/passwords', JSON.stringify(payload));
};

export const updateCustomer: UpdateCustomer = async (payload, sandbox, jwt) => {
  const { id, metadata, fullName, ...rest } = payload;
  const params: UpdateCustomerPayload = {
    id,
    ...rest,
  };
  return patch(sandbox, `/customers/${id}`, JSON.stringify(params), jwt);
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
