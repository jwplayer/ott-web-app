import type { TestConfig } from '@jwp/ott-testing/constants';

export type PaymentOffer = {
  label: string;
  price: string;
  paymentFee: string;
};

export type PaymentFields = {
  cardNumber: string;
  expiryDate: string;
  securityCode: string;
  creditCardholder: string;
};

export type ProviderProps = {
  config: TestConfig;
  monthlyOffer: PaymentOffer;
  yearlyOffer: PaymentOffer;
  paymentFields: PaymentFields;
  creditCard: string;
  applicableTax: number;
  canRenewSubscription: boolean;
  canOpenReceipts?: boolean;
  shouldMakePayment?: boolean;
  locale?: string | undefined;
  fieldWrapper?: string;
  hasInlineOfferSwitch: boolean;
};
