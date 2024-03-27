import type { ChangeSubscriptionPlanResponse, DefaultCreditCardData, SetDefaultCard } from '@inplayer-org/inplayer.js';

import type { CleengRequest } from './cleeng';
import type { EnvironmentServiceRequest, PromiseRequest } from './service';

// Subscription types
export type Subscription = {
  subscriptionId: number | string;
  offerId: string;
  accessFeeId?: string;
  status: 'active' | 'active_trial' | 'cancelled' | 'expired' | 'terminated';
  expiresAt: number;
  nextPaymentPrice: number;
  nextPaymentCurrency: string;
  paymentGateway: string;
  paymentMethod: string;
  offerTitle: string;
  pendingSwitchId: string | null;
  period: 'day' | 'week' | 'month' | 'year' | 'granted';
  totalPrice: number;
  unsubscribeUrl?: string;
};

export type PaymentDetail = {
  id: number;
  customerId: string;
  paymentGateway: string;
  paymentMethod: string;
  paymentMethodSpecificParams: PaymentMethodSpecificParam;
  paymentMethodId: number;
  active: boolean;
  currency?: string;
};

export type PaymentMethodSpecificParam = {
  payerId?: 'string';
  holderName?: 'string';
  variant?: 'string';
  lastCardFourDigits?: string;
  cardExpirationDate?: string;
  socialSecurityNumber?: string;
};

export type Transaction = {
  transactionId: string;
  transactionDate: number;
  trxToken?: string;
  offerId: string;
  offerType: string;
  offerTitle: string;
  offerPeriod: string;
  publisherSiteName?: string;
  transactionPriceExclTax: string;
  transactionCurrency: string;
  contentExternalId?: string;
  contentType?: string;
  shortUrl?: string;
  campaignId?: string;
  campaignName?: string;
  couponCode?: string | null;
  discountType?: string;
  discountRate?: string;
  discountValue?: string;
  discountedOfferPrice?: string;
  offerCurrency: string;
  offerPriceExclTax: string;
  applicableTax: string;
  transactionPriceInclTax: string;
  appliedExchangeRateCustomer?: string;
  customerId: string;
  customerEmail: string;
  customerLocale: string;
  customerCountry: string;
  customerIpCountry: string;
  customerCurrency: string;
  paymentMethod?: string;
  referalUrl?: string;
  transactionExternalData?: string;
  publisherId?: string;
};

// Payload types
export type GetSubscriptionsPayload = {
  customerId: string;
};

export type GetSubscriptionsResponse = {
  items: Subscription[];
};

export type UpdateSubscriptionPayload = {
  customerId: string;
  offerId: string;
  status: 'active' | 'cancelled';
  cancellationReason?: string;
  unsubscribeUrl?: string;
};

export type UpdateSubscriptionResponse = {
  offerId: string;
  status: 'active' | 'cancelled' | 'expired' | 'terminated';
  expiresAt: number;
};

export type GetPaymentDetailsPayload = {
  customerId: string;
};

export type GetPaymentDetailsResponse = {
  paymentDetails: PaymentDetail[];
};

export type GetTransactionsPayload = {
  customerId: string;
  limit?: string;
  offset?: string;
};

export type GetTransactionsResponse = {
  items: Transaction[];
};

export type UpdateCardDetailsPayload = DefaultCreditCardData;

export type UpdateCardDetails = EnvironmentServiceRequest<DefaultCreditCardData, SetDefaultCard>;

export type FetchReceiptPayload = {
  transactionId: string;
};

export type FetchReceiptResponse = Blob | string;

type ChangeSubscriptionPayload = {
  accessFeeId: string;
  subscriptionId: string;
};

type GetActivePaymentPayload = {
  customerId: string;
};

type GetAllTransactionsPayload = {
  customerId: string;
};

type GetActiveSubscriptionPayload = {
  customerId: string;
};

type GetActivePaymentResponse = PaymentDetail | null;

type GetAllTransactionsResponse = Transaction[] | null;

type GetActiveSubscriptionResponse = Subscription | null;

export type GetSubscriptions = CleengRequest<GetSubscriptionsPayload, GetSubscriptionsResponse>;
export type UpdateSubscription = CleengRequest<UpdateSubscriptionPayload, UpdateSubscriptionResponse>;
export type GetPaymentDetails = CleengRequest<GetPaymentDetailsPayload, GetPaymentDetailsResponse>;
export type GetTransactions = CleengRequest<GetTransactionsPayload, GetTransactionsResponse>;

export type GetActiveSubscription = PromiseRequest<GetActiveSubscriptionPayload, GetActiveSubscriptionResponse>;
export type GetAllTransactions = PromiseRequest<GetAllTransactionsPayload, GetAllTransactionsResponse>;
export type GetActivePayment = PromiseRequest<GetActivePaymentPayload, GetActivePaymentResponse>;
export type ChangeSubscription = EnvironmentServiceRequest<ChangeSubscriptionPayload, ChangeSubscriptionPlanResponse>;
export type FetchReceipt = EnvironmentServiceRequest<FetchReceiptPayload, FetchReceiptResponse>;
