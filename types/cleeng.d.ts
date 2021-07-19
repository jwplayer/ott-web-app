export type AuthData = {
  jwt: string;
  customerToken: string;
};

export type JwtDetails = {
  customerId: number;
  exp: number;
  publisherId: number;
};

export type LoginPayload = {
  email: string;
  password: string;
  offerId?: string;
  publisherId?: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  offerId?: string;
  publisherId?: string;
  locale: string;
  country: string;
  currency: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  externalData?: string;
};

export type ResetPasswordPayload = {
  customerEmail: string;
  offerId?: string;
  publisherId?: string;
  resetUrl?: string;
};

export type ChangePasswordPayload = {
  customerEmail: string;
  publisherId: string;
  resetPasswordToken: string;
  newPassword: string;
};

export type GetCustomerPayload = {
  customerId: string;
};

export type Subscription = {
  subscriptionId: number,
  offerId: string,
  status: 'active' | 'cancelled' | 'expired' | 'terminated',
  expiresAt: number,
  nextPaymentPrice: number,
  nextPaymentCurrency: string,
  paymentGateway: string,
  paymentMethod: string,
  offerTitle: string,
  period: string,
  totalPrice: number,
}

export type Customer = {
  id: string;
  email: string;
  locale: string;
  country: string;
  currency: string;
  lastUserIp: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  externalData?: string;
};

export type Offer = {
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
  offerUrl: string;
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
  period: string;
  freePeriods: number;
  freeDays: number;
  expiresAt: string | null;
  accessToTags: string[];
  videoId: string | null;
  contentExternalId: string | null;
  contentExternalData: string | null;
  contentAgeRestriction: string | null
}

export type Order = {
  id: number;
  customerId: number;
  customer: {
    locale: string;
    email: string
  };
  publisherId: number;
  offerId: string;
  offer: Offer;
  totalPrice: number;
  priceBreakdown: {
    offerPrice: number;
    discountAmount: number;
    discountedPrice: number;
    taxValue: number;
    customerServiceFee: number;
    paymentMethodFee: number
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
    periods: string
  };
  requiredPaymentDetails: boolean
};

export type Payment = {
  id: number,
  orderId: number,
  status: string,
  totalAmount: number,
  currency: string,
  customerId: number,
  paymentGateway: string,
  paymentMethod: string,
  externalPaymentId: string|number,
  couponId: number | null,
  amount: number,
  country: string,
  offerType: "subscription",
  taxValue: number,
  paymentMethodFee: number,
  customerServiceFee: number,
  rejectedReason: string | null,
  refundedReason: string | null,
  paymentDetailsId: number | null,
  paymentOperation: string
};

type CleengResponse<R> = { errors: [string], responseData: R };
type CleengRequest<P, R> = (payload: P, sandbox: boolean) => Promise<CleengResponse<R>>;
type CleengAuthRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<CleengResponse<R>>;

type Login = CleengRequest<LoginPayload, AuthData>;
type Register = CleengRequest<RegisterPayload, AuthData>;
type ResetPassword = CleengRequest<ResetPasswordPayload, Record<string, unknown>>;
type ChangePassword = CleengRequest<ChangePasswordPayload, Record<string, unknown>>;
type GetCustomer = CleengAuthRequest<GetCustomerPayload, Customer>;
