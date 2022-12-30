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

export type GetOffers = (payload: GetOffersPayload, sandbox: boolean) => Promise<Offer[]>;
export type GetOffer = EnvironmentServiceRequest<GetOfferPayload, Offer>;
export type CreateOrder = AuthServiceRequest<CreateOrderArgs, CreateOrderResponse>;
export type UpdateOrder = AuthServiceRequest<UpdateOrderPayload, UpdateOrderResponse>;
export type GetPaymentMethods = EmptyAuthServiceRequest<PaymentMethodResponse>;
export type PaymentWithoutDetails = AuthServiceRequest<PaymentWithoutDetailsPayload, Payment>;
export type PaymentWithAdyen = AuthServiceRequest<PaymentWithAdyenPayload, Payment>;
export type PaymentWithPayPal = AuthServiceRequest<PaymentWithPayPalPayload, PaymentWithPayPalResponse>;
export type GetEntitlements = AuthServiceRequest<GetEntitlementsPayload, GetEntitlementsResponse>;
