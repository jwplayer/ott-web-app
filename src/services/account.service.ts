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
} from '../../types/account';
import { getOverrideIP, IS_DEV_BUILD } from '../utils/common';

import { post, put, patch, get } from './cleeng.service';

export const login: Login = async (payload, sandbox) => {
  if (IS_DEV_BUILD) {
    // @ts-ignore
    payload.customerIP = window.overrideIP;
  }
  return post(sandbox, '/auths', JSON.stringify(payload));
};

export const register: Register = async (payload, sandbox) => {
  if (IS_DEV_BUILD) {
    // @ts-ignore
    payload.customerIP = getOverrideIP();
  }
  return post(sandbox, '/customers', JSON.stringify(payload));
};

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
  return get(sandbox, `/locales${IS_DEV_BUILD && getOverrideIP() ? '?customerIP=' + getOverrideIP() : ''}`);
};

export const getCaptureStatus: GetCaptureStatus = async ({ customerId }, sandbox, jwt) => {
  return get(sandbox, `/customers/${customerId}/capture/status`, jwt);
};

export const updateCaptureAnswers: UpdateCaptureAnswers = async ({ customerId, ...payload }, sandbox, jwt) => {
  return put(sandbox, `/customers/${customerId}/capture`, JSON.stringify(payload), jwt);
};
