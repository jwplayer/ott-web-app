import jwtDecode from 'jwt-decode';

import { post, put, patch, get } from './cleeng.service';

import type { Config } from '#types/Config';
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
  GetCaptureStatus,
  UpdateCaptureAnswers,
  AuthData,
  JwtDetails,
  GetCustomerConsentsResponse,
  GetCaptureStatusResponse,
  Capture,
  GetLocales,
  LoginPayload,
  RegisterPayload,
  UpdateCaptureAnswersPayload,
  UpdateCustomerConsentsPayload,
  UpdateCustomerPayload,
  ChangePasswordWithOldPassword,
  UpdatePersonalShelves,
} from '#types/account';
import cleengAuthService from '#src/services/cleeng.auth.service';

const getCustomerIdFromAuthData = (auth: AuthData) => {
  const decodedToken: JwtDetails = jwtDecode(auth.jwt);
  return decodedToken.customerId;
};

export const initialize = async (config: Config, logoutCallback: () => Promise<void>) => {
  await cleengAuthService.initialize(!!config.integrations.cleeng?.useSandbox, logoutCallback);
};

export const getAuthData = async () => {
  if (cleengAuthService.tokens) {
    return {
      jwt: cleengAuthService.tokens.accessToken,
      refreshToken: cleengAuthService.tokens.refreshToken,
    } as AuthData;
  }

  return null;
};

export const login: Login = async ({ config, email, password }) => {
  const payload: LoginPayload = {
    email,
    password,
    publisherId: config.integrations.cleeng?.id || '',
    customerIP: getOverrideIP(),
  };

  const { responseData: auth, errors }: ServiceResponse<AuthData> = await post(!!config.integrations.cleeng?.useSandbox, '/auths', JSON.stringify(payload));
  handleErrors(errors);

  await cleengAuthService.setTokens({ accessToken: auth.jwt, refreshToken: auth.refreshToken });

  const { user, customerConsents } = await getUser({ config });

  return {
    user,
    auth,
    customerConsents,
  };
};

export const register: Register = async ({ config, email, password }) => {
  const localesResponse = await getLocales(!!config.integrations.cleeng?.useSandbox);

  handleErrors(localesResponse.errors);

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
  handleErrors(errors);

  await cleengAuthService.setTokens({ accessToken: auth.jwt, refreshToken: auth.refreshToken });

  const { user, customerConsents } = await getUser({ config });

  return {
    user,
    auth,
    customerConsents,
  };
};

export const logout = async () => {
  // clear the persisted access tokens
  await cleengAuthService.clearTokens();
};

export async function getUser({ config }: { config: Config }) {
  const authData = await getAuthData();

  if (!authData) throw new Error('Not logged in');

  const customerId = getCustomerIdFromAuthData(authData);
  const { responseData: user, errors } = await getCustomer({ customerId }, !!config.integrations.cleeng?.useSandbox);

  handleErrors(errors);

  const consentsPayload = {
    config,
    customer: user,
  };

  const { consents } = await getCustomerConsents(consentsPayload);

  return {
    user,
    customerConsents: consents,
  };
}

export const getPublisherConsents: GetPublisherConsents = async (config) => {
  const { cleeng } = config.integrations;
  const response = await get(!!cleeng?.useSandbox, `/publishers/${cleeng?.id}/consents`);

  handleErrors(response.errors);

  return {
    consents: response?.responseData?.consents || [],
  };
};

export const getCustomerConsents: GetCustomerConsents = async (payload) => {
  const { config, customer } = payload;
  const { cleeng } = config.integrations;

  const response: ServiceResponse<GetCustomerConsentsResponse> = await get(!!cleeng?.useSandbox, `/customers/${customer?.id}/consents`, { authenticate: true });
  handleErrors(response.errors);

  return {
    consents: response?.responseData?.consents || [],
  };
};

export const updateCustomerConsents: UpdateCustomerConsents = async (payload) => {
  const { config, customer } = payload;
  const { cleeng } = config.integrations;

  const params: UpdateCustomerConsentsPayload = {
    id: customer.id,
    consents: payload.consents,
  };

  const response: ServiceResponse<never> = await put(!!cleeng?.useSandbox, `/customers/${customer?.id}/consents`, JSON.stringify(params), {
    authenticate: true,
  });
  handleErrors(response.errors);

  return await getCustomerConsents(payload);
};

export const getCaptureStatus: GetCaptureStatus = async ({ customer }, sandbox) => {
  const response: ServiceResponse<GetCaptureStatusResponse> = await get(sandbox, `/customers/${customer?.id}/capture/status`, { authenticate: true });

  handleErrors(response.errors);

  return response;
};

export const updateCaptureAnswers: UpdateCaptureAnswers = async ({ customer, ...payload }, sandbox) => {
  const params: UpdateCaptureAnswersPayload = {
    customerId: customer.id,
    ...payload,
  };

  const response: ServiceResponse<Capture> = await put(sandbox, `/customers/${customer.id}/capture`, JSON.stringify(params), { authenticate: true });
  handleErrors(response.errors);

  const { responseData, errors } = await getCustomer({ customerId: customer.id }, sandbox);
  handleErrors(errors);

  return {
    errors: [],
    responseData,
  };
};

export const resetPassword: ResetPassword = async (payload, sandbox) => {
  return put(sandbox, '/customers/passwords', JSON.stringify(payload));
};

export const changePasswordWithResetToken: ChangePassword = async (payload, sandbox) => {
  return patch(sandbox, '/customers/passwords', JSON.stringify(payload));
};

export const changePasswordWithOldPassword: ChangePasswordWithOldPassword = async () => {
  return {
    errors: [],
    responseData: {},
  };
};

export const updateCustomer: UpdateCustomer = async (payload, sandbox) => {
  const { id, metadata, fullName, ...rest } = payload;
  const params: UpdateCustomerPayload = {
    id,
    ...rest,
  };
  // enable keepalive to ensure data is persisted when closing the browser/tab
  return patch(sandbox, `/customers/${id}`, JSON.stringify(params), { authenticate: true, keepalive: true });
};

export const getCustomer: GetCustomer = async (payload, sandbox) => {
  return get(sandbox, `/customers/${payload.customerId}`, { authenticate: true });
};

export const getLocales: GetLocales = async (sandbox) => {
  return get(sandbox, `/locales${getOverrideIP() ? '?customerIP=' + getOverrideIP() : ''}`);
};

const handleErrors = (errors: ApiResponse['errors']) => {
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
};

export const updatePersonalShelves: UpdatePersonalShelves = async (payload, sandbox) => {
  return await updateCustomer(payload, sandbox);
};

export const exportAccountData = () => null;

export const getSocialUrls = () => null;
export const deleteAccount = () => null;

export const canUpdateEmail = true;

export const canSupportEmptyFullName = true;

export const canChangePasswordWithOldPassword = false;
export const subscribeToNotifications = async () => true;
export const canRenewSubscription = true;
export const canExportAccountData = false;
export const canDeleteAccount = false;
export const canUpdatePaymentMethod = true;
export const canShowReceipts = true;
export const canManageProfiles = false;

export const listProfiles = () => null;
export const createProfile = () => null;
export const enterProfile = () => null;
export const updateProfile = () => null;
export const getProfileDetails = () => null;
export const deleteProfile = () => null;
