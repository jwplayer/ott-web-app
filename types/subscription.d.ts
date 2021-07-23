// Subscription types
export type Subscription = {
  subscriptionId: number;
  offerId: string;
  status: 'active' | 'cancelled' | 'expired' | 'terminated';
  expiresAt: number;
  nextPaymentPrice: number;
  nextPaymentCurrency: string;
  paymentGateway: string;
  paymentMethod: string;
  offerTitle: string;
  period: string;
  totalPrice: number;
};

export type PaymentDetail = {
  id: string;
  customerId: string;
  paymentGateway: string;
  paymendMethod: string;
  paymentMethodSpecificParams: Record<PaymentMethodSpecificParam>;
  paymentMethodId: string;
  active: boolean;
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
  transactionId?: string;
  transactionDate?: number;
  offerId?: string;
  offerType?: string;
  offerTitle?: string;
  offerPeriod?: string;
  publisherSiteName?: string;
  transactionPriceExclTax?: string;
  transactionCurrency?: string;
  contentExternalId?: string;
  contentType?: string;
  shortUrl?: string;
  campaignId?: string;
  campaignName?: string;
  couponCode?: string;
  discountType?: string;
  discountRate?: string;
  discountValue?: string;
  discountedOfferPrice?: string;
  offerCurrency?: string;
  offerPriceExclTax?: string;
  applicableTax?: string;
  transactionPriceInclTax?: string;
  appliedExchangeRateCustomer?: string;
  customerId?: string;
  customerEmail?: string;
  customerLocale?: string;
  customerCountry?: string;
  customerIpCountry?: string;
  customerCurrency?: string;
  paymentMethod?: string;
  referalUrl?: string;
  transactionExternalData?: string;
  publisherId?: string;
};

// Payload types
export type GetSubscriptionsPayload = {
  customerId: string;
};

export type UpdateSubscriptionPayload = {
  customerId: string;
  offerId: string;
  status: string;
  cancellationReason?: string;
};

export type GetPaymentDetailsPayload = {
  customerId: string;
};

export type GetTransactionsPayload = {
  customerId: string;
  limit?: string;
  offset?: string;
};

type GetSubscriptions = CleengAuthRequest<GetSubscriptionsPayload, Subscription[]>;
type UpdateSubscriptions = CleengAuthRequest<UpdateSubscriptionPayload, Subscription>;
type GetPaymentDetails = CleengAuthRequest<GetPaymentDetailsPayload, Record<string, PaymentDetail[]>>;
type GetTransactions = CleengAuthRequest<GetTransactionsPayload, Transaction[]>;
