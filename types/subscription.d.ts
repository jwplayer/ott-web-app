// Subscription types
export type Subscription = {
  subscriptionId: number | string;
  offerId: string;
  status: 'active' | 'cancelled' | 'expired' | 'terminated';
  expiresAt: number;
  nextPaymentPrice: number;
  nextPaymentCurrency: string;
  paymentGateway: string;
  paymentMethod: string;
  offerTitle: string;
  period: 'day' | 'week' | 'month' | 'year' | 'granted';
  totalPrice: number;
  unsubscribeUrl?: string;
};

export type PaymentDetail = {
  id: number;
  customerId: string;
  paymentGateway: string;
  paymentMethod: string;
  paymentMethodSpecificParams: Record<PaymentMethodSpecificParam>;
  paymentMethodId: number;
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
  transactionId: string;
  transactionDate: number;
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

type GetSubscriptions = CleengAuthRequest<GetSubscriptionsPayload, GetSubscriptionsResponse>;
type UpdateSubscription = CleengAuthRequest<UpdateSubscriptionPayload, UpdateSubscriptionResponse>;
type GetPaymentDetails = CleengAuthRequest<GetPaymentDetailsPayload, GetPaymentDetailsResponse>;
type GetTransactions = CleengAuthRequest<GetTransactionsPayload, GetTransactionsResponse>;
