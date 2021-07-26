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
  period: 'day' | 'week' | 'month' | 'year';
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

export type GetOfferPayload = {
  offerId: string;
};

export type GetOffer = CleengRequest<GetOfferPayload, Offer>;
