import { injectable } from 'inversify';

import { createURL } from '../../../utils/urlFormatting';
import type {
  FetchReceipt,
  GetActivePayment,
  GetActiveSubscription,
  GetAllTransactions,
  GetPaymentDetails,
  GetSubscriptions,
  GetTransactions,
  UpdateSubscription,
} from '../../../../types/subscription';
import SubscriptionService from '../SubscriptionService';

import CleengService from './CleengService';

@injectable()
export default class CleengSubscriptionService extends SubscriptionService {
  private readonly cleengService: CleengService;

  constructor(cleengService: CleengService) {
    super();
    this.cleengService = cleengService;
  }

  getActiveSubscription: GetActiveSubscription = async ({ customerId }) => {
    const response = await this.getSubscriptions({ customerId });

    if (response.errors.length > 0) return null;

    return response.responseData.items.find((item) => item.status === 'active' || item.status === 'cancelled') || null;
  };

  getAllTransactions: GetAllTransactions = async ({ customerId }) => {
    const response = await this.getTransactions({ customerId });

    if (response.errors.length > 0) return null;

    return response.responseData.items;
  };

  getActivePayment: GetActivePayment = async ({ customerId }) => {
    const response = await this.getPaymentDetails({ customerId });

    if (response.errors.length > 0) return null;

    return response.responseData.paymentDetails.find((paymentDetails) => paymentDetails.active) || null;
  };

  getSubscriptions: GetSubscriptions = async (payload) => {
    return this.cleengService.get(`/customers/${payload.customerId}/subscriptions`, { authenticate: true });
  };

  updateSubscription: UpdateSubscription = async (payload) => {
    return this.cleengService.patch(`/customers/${payload.customerId}/subscriptions`, JSON.stringify(payload), { authenticate: true });
  };

  getPaymentDetails: GetPaymentDetails = async (payload) => {
    return this.cleengService.get(`/customers/${payload.customerId}/payment_details`, { authenticate: true });
  };

  getTransactions: GetTransactions = async ({ customerId, limit, offset }) => {
    return this.cleengService.get(createURL(`/customers/${customerId}/transactions`, { limit, offset }), { authenticate: true });
  };

  fetchReceipt: FetchReceipt = async ({ transactionId }) => {
    return this.cleengService.get(`/receipt/${transactionId}`, { authenticate: true });
  };

  updateCardDetails: undefined;

  changeSubscription: undefined;
}
