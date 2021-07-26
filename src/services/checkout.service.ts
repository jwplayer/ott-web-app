import type { CreateOrder, GetOffer, GetPaymentMethods, UpdateOrder } from '../../types/checkout';

import { get, post, patch } from './cleeng.service';

export const getOffer: GetOffer = async (payload, sandbox) => {
  return get(sandbox, `/offers/${payload.offerId}`);
};

export const createOrder: CreateOrder = async (payload, sandbox, jwt) => {
  return post(sandbox, '/orders', JSON.stringify(payload), jwt);
};

export const updateOrder: UpdateOrder = async ({  orderId, ...payload }, sandbox, jwt) => {
  return patch(sandbox, `/orders/${orderId}`, JSON.stringify(payload), jwt);
};

export const getPaymentMethods: GetPaymentMethods = async (sandbox, jwt) => {
  return get(sandbox, '/payment-methods', jwt);
};
