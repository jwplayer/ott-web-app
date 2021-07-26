import type { GetPaymentDetails, GetSubscriptions, GetTransactions, UpdateSubscription } from 'types/subscription';
import type {} from '../../types/account';

import { addQueryParams } from '../utils/formatting';

import { patch, get } from './cleeng.service';

export const getSubscriptions: GetSubscriptions = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/subscriptions`, undefined, jwt);
};

export const updateSubscription: UpdateSubscription = async (payload, sandbox, jwt) => {
  return patch(sandbox, `/customers/${payload.customerId}/subscriptions`, JSON.stringify(payload), jwt);
};

export const getPaymentDetails: GetPaymentDetails = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/payment_details`, undefined, jwt);
};

export const getTransactions: GetTransactions = async ({ customerId, limit, offset }, sandbox, jwt) => {
  return get(sandbox, addQueryParams(`/customers/${customerId}/transactions`, { limit, offset }), undefined, jwt);
};
