import type { GetPaymentDetails, GetSubscriptions, GetTransactions, UpdateSubscriptions } from 'types/subscription';
import type {} from '../../types/account';

import { patch, get } from './cleeng.service';

export const getSubscriptions: GetSubscriptions = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/subscriptions`, undefined, jwt);
};

export const updateSubscriptions: UpdateSubscriptions = async (payload, sandbox, jwt) => {
  return patch(sandbox, `/customers/${payload.customerId}/subscriptions`, JSON.stringify(payload), jwt);
};

export const getPaymentDetails: GetPaymentDetails = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/payment_details`, undefined, jwt);
};

export const getTransactions: GetTransactions = async (payload, sandbox, jwt) => {
  return get(sandbox, `/customers/${payload.customerId}/transactions`, JSON.stringify(payload), jwt);
};
