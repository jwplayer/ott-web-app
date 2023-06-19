import { patch, get } from './cleeng.service';

import { addQueryParams } from '#src/utils/formatting';
import type { FetchReceipt, GetPaymentDetails, GetSubscriptions, GetTransactions, UpdateSubscription } from '#types/subscription';

export async function getActiveSubscription({ sandbox, customerId }: { sandbox: boolean; customerId: string }) {
  const response = await getSubscriptions({ customerId }, sandbox);

  if (response.errors.length > 0) return null;

  return response.responseData.items.find((item) => item.status === 'active' || item.status === 'cancelled') || null;
}

export async function getAllTransactions({ sandbox, customerId }: { sandbox: boolean; customerId: string }) {
  const response = await getTransactions({ customerId }, sandbox);

  if (response.errors.length > 0) return null;

  return response.responseData.items;
}

export async function getActivePayment({ sandbox, customerId }: { sandbox: boolean; customerId: string }) {
  const response = await getPaymentDetails({ customerId }, sandbox);

  if (response.errors.length > 0) return null;

  return response.responseData.paymentDetails.find((paymentDetails) => paymentDetails.active) || null;
}

export const getSubscriptions: GetSubscriptions = async (payload, sandbox) => {
  return get(sandbox, `/customers/${payload.customerId}/subscriptions`, { authenticate: true });
};

export const updateSubscription: UpdateSubscription = async (payload, sandbox) => {
  return patch(sandbox, `/customers/${payload.customerId}/subscriptions`, JSON.stringify(payload), { authenticate: true });
};

export const getPaymentDetails: GetPaymentDetails = async (payload, sandbox) => {
  return get(sandbox, `/customers/${payload.customerId}/payment_details`, { authenticate: true });
};

export const getTransactions: GetTransactions = async ({ customerId, limit, offset }, sandbox) => {
  return get(sandbox, addQueryParams(`/customers/${customerId}/transactions`, { limit, offset }), { authenticate: true });
};

export const fetchReceipt: FetchReceipt = async ({ transactionId }, sandbox) => {
  return get(sandbox, `/receipt/${transactionId}`, { authenticate: true });
};
export const updateCardDetails = () => null;
