import { get, post, patch } from './cleeng.service';

import type {
  CreateOrder,
  GetEntitlements,
  GetOffer,
  GetPaymentMethods,
  PaymentWithAdyen,
  PaymentWithoutDetails,
  PaymentWithPayPal,
  UpdateOrder,
} from '#types/checkout';
import { getOverrideIP, IS_DEV_BUILD } from '#src/utils/common';

export const getOffer: GetOffer = async (payload, sandbox) => {
  // @ts-ignore
  return get(sandbox, `/offers/${payload.offerId}${IS_DEV_BUILD && getOverrideIP() ? '?customerIP=' + getOverrideIP() : ''}`);
};

export const createOrder: CreateOrder = async (payload, sandbox, jwt) => {
  return post(sandbox, '/orders', JSON.stringify(payload), jwt);
};

export const updateOrder: UpdateOrder = async ({ orderId, ...payload }, sandbox, jwt) => {
  return patch(sandbox, `/orders/${orderId}`, JSON.stringify(payload), jwt);
};

export const getPaymentMethods: GetPaymentMethods = async (sandbox, jwt) => {
  return get(sandbox, '/payment-methods', jwt);
};

export const paymentWithoutDetails: PaymentWithoutDetails = async (payload, sandbox, jwt) => {
  return post(sandbox, '/payments', JSON.stringify(payload), jwt);
};

export const paymentWithAdyen: PaymentWithAdyen = async (payload, sandbox, jwt) => {
  if (IS_DEV_BUILD) {
    // @ts-ignore
    payload.customerIP = getOverrideIP();
  }
  return post(sandbox, '/connectors/adyen/payments', JSON.stringify(payload), jwt);
};

export const paymentWithPayPal: PaymentWithPayPal = async (payload, sandbox, jwt) => {
  return post(sandbox, '/connectors/paypal/v1/tokens', JSON.stringify(payload), jwt);
};

export const getEntitlements: GetEntitlements = async (payload, sandbox, jwt = '') => {
  return get(sandbox, `/entitlements/${payload.offerId}`, jwt);
};
