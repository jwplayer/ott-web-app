import axios from 'axios';

import type { CleengResponse, AuthData, LoginPayload, RegisterPayload, Customer, WithCleengParams, CleengParams, LocalesData } from '#types/cleeng';
import type { UpdateCustomerPayload } from '#types/account';
import { getOverrideIP } from '#src/utils/common';

// config

export const getBaseUrl = (sandbox: boolean) => (sandbox ? 'https://mediastore-sandbox.cleeng.com' : 'https://mediastore.cleeng.com');

const api = axios.create({
  baseURL: getBaseUrl(false),
});

const handleErrors = (errors: string[]) => {
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
};

const withAuth = (jwt?: string) => {
  return {
    headers: { Authorization: jwt ? `Bearer ${jwt}` : undefined },
  };
};

// global

export const getLocales = async ({ sandbox }: CleengParams) => {
  const {
    data: { responseData },
  } = await api.get<CleengResponse<LocalesData>>(getBaseUrl(sandbox) + `/locales${getOverrideIP() ? '?customerIP=' + getOverrideIP() : ''}`);

  return responseData;
};

// account

/**
 * Log in to an existing account
 */
export const login = async ({ sandbox, publisherId, email, password }: WithCleengParams<{ email: string; password: string }>) => {
  const payload: LoginPayload = {
    email,
    password,
    publisherId,
    customerIP: getOverrideIP(),
  };

  const {
    data: { responseData, errors },
  } = await api.post<CleengResponse<AuthData>>(getBaseUrl(sandbox) + '/auths', payload);

  handleErrors(errors);

  return responseData;
};

/**
 * Register a new account
 */
export const register = async ({
  sandbox,
  publisherId,
  email,
  password,
  locale,
  country,
  currency,
}: WithCleengParams<{ email: string; password: string; locale: string; country: string; currency: string }>) => {
  const payload: RegisterPayload = {
    email,
    password,
    publisherId,
    locale,
    country,
    currency,
    customerIP: getOverrideIP(),
  };

  const {
    data: { responseData, errors },
  } = await api.post<CleengResponse<AuthData>>(getBaseUrl(sandbox) + '/customers', payload);

  handleErrors(errors);

  return responseData;
};

export const refreshToken = async ({ refreshToken, sandbox }: WithCleengParams<{ refreshToken: string }>) => {
  return api.post<CleengResponse<AuthData>>(getBaseUrl(sandbox) + '/auths/refresh_token', { refreshToken });
};

/**
 * Get the customer data
 */
export const getCustomer = async ({ sandbox, customerId, jwt }: WithCleengParams<{ customerId: string }>) => {
  const {
    data: { responseData, errors },
  } = await api.get<CleengResponse<Customer>>(getBaseUrl(sandbox) + `/customers/${customerId}`, withAuth(jwt));

  handleErrors(errors);

  return responseData;
};

/**
 * Update customer data
 */
export const updateCustomer = async ({ sandbox, customerId, jwt, payload }: WithCleengParams<{ customerId: string, payload: UpdateCustomerPayload }>) => {
  const {
    data: { responseData, errors },
  } = await api.patch<CleengResponse<Customer>>(getBaseUrl(sandbox) + `/customers/${customerId}`, payload, withAuth(jwt));

  handleErrors(errors);

  return responseData;
};
