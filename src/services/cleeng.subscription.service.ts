import { patch, get } from './cleeng.service';

import { addQueryParams } from '#src/utils/formatting';
import type { GetPaymentDetails, GetSubscriptions, GetTransactions, UpdateSubscription } from '#types/subscription';

export async function getActiveSubscription({ sandbox, customerId, jwt }: { sandbox: boolean; customerId: string; jwt: string }) {
  const response = await getSubscriptions({ customerId }, sandbox, jwt);

  if (response.errors.length > 0) return null;

  return response.responseData.items.find((item) => item.status === 'active' || item.status === 'cancelled') || null;
}

export async function getAllTransactions({ sandbox, customerId, jwt }: { sandbox: boolean; customerId: string; jwt: string }) {
  const response = await getTransactions({ customerId }, sandbox, jwt);

  if (response.errors.length > 0) return null;

  return response.responseData.items;
}

export async function getActivePayment({ sandbox, customerId, jwt }: { sandbox: boolean; customerId: string; jwt: string }) {
  const response = await getPaymentDetails({ customerId }, sandbox, jwt);

  if (response.errors.length > 0) return null;

  return response.responseData.paymentDetails.find((paymentDetails) => paymentDetails.active) || null;
}

export const getSubscriptions: GetSubscriptions = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/subscriptions`, jwt);
};

export const updateSubscription: UpdateSubscription = async (payload, sandbox, jwt) => {
  return patch(sandbox, `/customers/${payload.customerId}/subscriptions`, JSON.stringify(payload), jwt);
};

export const getPaymentDetails: GetPaymentDetails = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/payment_details`, jwt);
};

export const getTransactions: GetTransactions = async ({ customerId, limit, offset }, sandbox, jwt) => {
  return get(sandbox, addQueryParams(`/customers/${customerId}/transactions`, { limit, offset }), jwt);
};
