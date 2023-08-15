import type { PayloadWithIPOverride } from '#types/account';

export type Offer = {
  id: number | null;
  offerId: string;
  offerPrice: number;
  offerCurrency: string;
  offerCurrencySymbol: string;
  offerCountry: string;
  customerPriceInclTax: number;
  customerPriceExclTax: number;
  customerCurrency: string;
  customerCurrencySymbol: string;
  customerCountry: string;
  discountedCustomerPriceInclTax: number | null;
  discountedCustomerPriceExclTax: number | null;
  discountPeriods: number | null;
  durationPeriod?: string | null; // Duration isn't sent from Cleeng yet
  durationAmount?: number | null; // Same for this
  offerUrl: string | null;
  offerTitle: string;
  offerDescription: null;
  active: boolean;
  createdAt: number;
  updatedAt: number;
  applicableTaxRate: number;
  geoRestrictionEnabled: boolean;
  geoRestrictionType: string | null;
  geoRestrictionCountries: string[];
  socialCommissionRate: number;
  averageRating: number;
  contentType: string | null;
  period: 'day' | 'week' | 'month' | 'year';
  freePeriods: number | null;
  freeDays: number | null;
  expiresAt: string | null;
  accessToTags: string[];
  videoId: string | null;
  contentExternalId: number | null;
  contentExternalData: string | null;
  contentAgeRestriction: string | null;
  planSwitchEnabled?: boolean;
};

export type OrderOffer = {
  title: string;
  description: string | null;
  price: number;
  currency: string;
};

export type Order = {
  id: number;
  customerId: string;
  customer: {
    locale: string;
    email: string;
  };
  publisherId: number;
  offerId: string;
  offer: OrderOffer;
  totalPrice: number;
  priceBreakdown: {
    offerPrice: number;
    discountAmount: number;
    discountedPrice: number;
    taxValue: number;
    customerServiceFee: number;
    paymentMethodFee: number;
  };
  taxRate: number;
  taxBreakdown: string | null;
  currency: string;
  country: string | null;
  paymentMethodId: number;
  expirationDate: number;
  billingAddress: null;
  couponId: null;
  discount: {
    applied: boolean;
    type: string;
    periods: number;
  };
  requiredPaymentDetails: boolean;
};

export type PaymentMethod = {
  id: number;
  methodName: 'card' | 'paypal';
  provider?: 'stripe' | 'adyen';
  logoUrl: string;
};

export type PaymentMethodResponse = {
  message: string;
  paymentMethods: PaymentMethod[];
  status: number;
};

export type PaymentStatus = {
  status: 'successful' | 'failed';
  message?: string;
};

export type CardPaymentData = {
  couponCode?: string;
  cardholderName: string;
  cardNumber: string | number;
  cardExpiry: string;
  cardExpMonth?: string;
  cardExpYear?: string;
  cardCVC: string;
};

export type Payment = {
  id: number;
  orderId: number;
  status: string;
  totalAmount: number;
  currency: string;
  customerId: string;
  paymentGateway: string;
  paymentMethod: string;
  externalPaymentId: string | number;
  couponId: number | null;
  amount: number;
  country: string;
  offerType: 'subscription';
  taxValue: number;
  paymentMethodFee: number;
  customerServiceFee: number;
  rejectedReason: string | null;
  refundedReason: string | null;
  paymentDetailsId: number | null;
  paymentOperation: string;
  gatewaySpecificParams?: string;
};

export type GetOfferPayload = {
  offerId: string;
};

export type GetOffersPayload = {
  offerIds: string[] | number[];
};

export type CreateOrderPayload = {
  offerId: string;
  customerId: string;
  country: string;
  currency: string;
  customerIP: string;
  paymentMethodId?: number;
  couponCode?: string;
};

export type SwitchOffer = {
  currency: string;
  currencySymbol: string;
  nextPaymentPrice: number;
  nextPaymentPriceCurrency: string;
  nextPaymentPriceCurrencySymbol: string;
  period: string;
  price: number;
  switchDirection: string;
  title: string;
  toOfferId: string;
};

export type GetSubscriptionSwitchesPayload = {
  customerId: string;
  offerId: string;
};

export type GetSubscriptionSwitchesResponse = {
  available: SwitchOffer[];
  unavailable: SwitchOffer[];
};

export type GetSubscriptionSwitchPayload = {
  switchId: string;
};

export type GetSubscriptionSwitchResponse = {
  id: id;
  customerId: number;
  direction: 'downgrade' | 'upgrade';
  algorithm: string;
  fromOfferId: string;
  toOfferId: string;
  subscriptionId: string;
  status: string;
  createdAt: number;
  updatedAt: number;
};

export type SwitchSubscriptionPayload = {
  customerId: string;
  offerId: string;
  toOfferId: string;
  switchDirection: string;
};

export type SwitchSubscriptionResponse = string;

export type CreateOrderArgs = {
  offer: Offer;
  customerId: string;
  country: string;
  customerIP: string;
  paymentMethodId?: number;
  couponCode?: string;
};

export type CreateOrderResponse = {
  message: string;
  order: Order;
  success: boolean;
};

export type UpdateOrderPayload = {
  order: Order;
  paymentMethodId?: number;
  couponCode?: string | null;
};

export type UpdateOrderResponse = {
  message: string;
  order: Order;
  success: boolean;
};

export type GetOrderPayload = {
  orderId: number;
};

export type GetOrderResponse = {
  message: string;
  order: Order;
  success: boolean;
};

export type PaymentWithoutDetailsPayload = {
  orderId: number;
};

export type PaymentWithAdyenPayload = PayloadWithIPOverride & {
  orderId: number;
  card: AdyenPaymentMethod;
};

export type PaymentWithPayPalPayload = {
  order: Order;
  successUrl: string;
  cancelUrl: string;
  errorUrl: string;
  couponCode?: string;
};

export type PaymentWithPayPalResponse = {
  redirectUrl: string;
};

export type GetEntitlementsPayload = {
  offerId: string;
};

export type GetEntitlementsResponse = {
  accessGranted: boolean;
  expiresAt: number;
};

export type AdyenPaymentMethodPayload = {
  orderId?: number;
  returnUrl: string;
  filteredPaymentMethods?: string[];
  filterPaymentMethodsByType?: string[];
};

export type InitialAdyenPaymentPayload = {
  orderId: number;
  returnUrl: string;
  paymentMethod: AdyenPaymentMethod;
  billingAddress?: {
    street: string;
    houseNumberOrName: string;
    city: string;
    postalCode: string;
    country: string;
    stateOrProvince: string;
  };
  origin?: string;
  customerIP?: string;
  browserInfo?: unknown;
  attemptAuthentication?: 'always' | 'never' | 'preferNo';
  enable3DSRedirectFlow?: boolean;
};

export type AdyenAction = {
  action: {
    paymentMethodType: string;
    url: string;
    data: unknown;
    method: string;
    type: string;
  };
};

export type InitialAdyenPayment = Payment | AdyenAction;

export type FinalizeAdyenPaymentPayload = {
  orderId: number;
  details: unknown;
  paymentData?: string;
};

export type FinalizeAdyenPayment = {
  payment: Payment;
};

export type AdyenPaymentSession = {
  allowedPaymentMethods: string[];
  blockedPaymentMethods: string[];
  shopperStatement: string;
  amount: {
    currency: string;
    value: number;
  };
  countryCode: string;
  expiresAt: string;
  id: string;
  returnUrl: string;
  merchantAccount: string;
  reference: string;
  paymentMethod: AdyenPaymentMethod[];
  sessionData: string;
};

export type UpdatePaymentWithPayPalPayload = Omit<PaymentWithPaypalPayload, 'orderId'> & { paymentMethodId: number };

export type DeletePaymentMethodPayload = {
  paymentDetailsId: number;
};

export type DeletePaymentMethodResponse = {
  paymentDetailsId: string;
};

export type AddAdyenPaymentDetailsPayload = Omit<InitialAdyenPaymentPayload, 'orderId'> & { paymentMethodId: number };

export type AddAdyenPaymentDetailsResponse = Omit<PaymentDetail, 'customerId'>;

export type FinalizeAdyenPaymentDetailsPayload = Omit<FinalizeAdyenPaymentPayload, 'orderId'> & { paymentMethodId: number };

export type FinalizeAdyenPaymentDetailsResponse = PaymentDetail;

export type GetOffers = (payload: GetOffersPayload, sandbox: boolean) => Promise<Offer[]>;
export type GetOffer = EnvironmentServiceRequest<GetOfferPayload, Offer>;
export type CreateOrder = EnvironmentServiceRequest<CreateOrderArgs, CreateOrderResponse>;
export type GetOrder = EnvironmentServiceRequest<GetOrderPayload, GetOrderResponse>;
export type UpdateOrder = EnvironmentServiceRequest<UpdateOrderPayload, UpdateOrderResponse>;
export type GetPaymentMethods = EmptyEnvironmentServiceRequest<PaymentMethodResponse>;
export type PaymentWithoutDetails = EnvironmentServiceRequest<PaymentWithoutDetailsPayload, Payment>;
export type PaymentWithAdyen = EnvironmentServiceRequest<PaymentWithAdyenPayload, Payment>;
export type PaymentWithPayPal = EnvironmentServiceRequest<PaymentWithPayPalPayload, PaymentWithPayPalResponse>;
export type GetSubscriptionSwitches = EnvironmentServiceRequest<GetSubscriptionSwitchesPayload, GetSubscriptionSwitchesResponse>;
export type GetSubscriptionSwitch = EnvironmentServiceRequest<GetSubscriptionSwitchPayload, GetSubscriptionSwitchResponse>;
export type SwitchSubscription = EnvironmentServiceRequest<SwitchSubscriptionPayload, SwitchSubscriptionResponse>;
export type GetEntitlements = EnvironmentServiceRequest<GetEntitlementsPayload, GetEntitlementsResponse>;
export type GetAdyenPaymentSession = EnvironmentServiceRequest<AdyenPaymentMethodPayload, AdyenPaymentSession>;
export type GetInitialAdyenPayment = EnvironmentServiceRequest<InitialAdyenPaymentPayload, InitialAdyenPayment>;
export type GetFinalizeAdyenPayment = EnvironmentServiceRequest<FinalizeAdyenPaymentPayload, FinalizeAdyenPayment>;
export type UpdatePaymentWithPayPal = EnvironmentServiceRequest<UpdatePaymentWithPayPalPayload, PaymentWithPayPalResponse>;
export type DeletePaymentMethod = EnvironmentServiceRequest<DeletePaymentMethodPayload, DeletePaymentMethodResponse>;
export type AddAdyenPaymentDetails = EnvironmentServiceRequest<AddAdyenPaymentDetailsPayload, AddAdyenPaymentDetailsResponse>;
export type FinalizeAdyenPaymentDetails = EnvironmentServiceRequest<FinalizeAdyenPaymentDetailsPayload, FinalizeAdyenPaymentDetailsResponse>;
