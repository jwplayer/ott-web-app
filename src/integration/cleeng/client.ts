import axios from 'axios';
import joi from 'joi';

import type { CleengResponse, AuthData, LoginPayload, RegisterPayload, Customer, WithCleengParams, LocalesData } from '#types/cleeng';
import type { UpdateCustomerPayload } from '#types/account';
import { getOverrideIP } from '#src/utils/common';

const responseSchema = joi.object<CleengResponse<unknown>>({
  responseData: joi.object(),
  errors: joi.array().items(joi.string()),
});

// config

let accessToken: string | undefined;

export const getBaseUrl = (sandbox: boolean) => (sandbox ? 'https://mediastore-sandbox.cleeng.com' : 'https://mediastore.cleeng.com');

const transformResponse = (data: string) => {
  const parsed = JSON.parse(data);
  const { value, error } = responseSchema.validate(parsed, { abortEarly: true });

  if (error || !value) throw new Error('Response validation failed: ' + error?.message);
  if (value.errors.length) throw new Error(value.errors[0]);

  return value.responseData;
};

const api = axios.create({
  baseURL: getBaseUrl(false),
  transformResponse,
});

const apiAuth = axios.create({
  baseURL: getBaseUrl(false),
  transformRequest: function () {
    if (!accessToken) throw new Error('Access token missing from authenticated request');
    this.headers.set('Authorization', `Bearer ${accessToken}`);
  },
  transformResponse,
});

export const setAccessToken = (token: string | undefined) => {
  accessToken = token;
};

export const setSandbox = (sandbox: boolean) => {
  api.defaults.baseURL = getBaseUrl(sandbox);
  apiAuth.defaults.baseURL = getBaseUrl(sandbox);
};

// global

export const getLocales = async () => {
  const { data } = await api.get<LocalesData>(`/locales${getOverrideIP() ? '?customerIP=' + getOverrideIP() : ''}`);

  return data;
};

// account

/**
 * Log in to an existing account
 */
export const login = async ({ publisherId, email, password }: WithCleengParams<{ email: string; password: string }>) => {
  const payload: LoginPayload = {
    email,
    password,
    publisherId,
    customerIP: getOverrideIP(),
  };

  const { data } = await api.post<AuthData>('/auths', payload);

  return data;
};

/**
 * Register a new account
 */
export const register = async ({
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

  const { data } = await api.post<AuthData>('/customers', payload);

  return data;
};

export const refreshToken = async ({ refreshToken }: WithCleengParams<{ refreshToken: string }>) => {
  const { data } = await api.post<AuthData>('/auths/refresh_token', { refreshToken });

  return data;
};

/**
 * Get the customer data
 */
export const getCustomer = async ({ customerId }: WithCleengParams<{ customerId: string }>) => {
  const { data } = await apiAuth.get<Customer>(`/customers/${customerId}`);

  return data;
};

/**
 * Update customer data
 */
export const updateCustomer = async ({ customerId, payload }: WithCleengParams<{ customerId: string; payload: UpdateCustomerPayload }>) => {
  const { data } = await apiAuth.patch<Customer>(`/customers/${customerId}`, payload);

  return data;
};
