export interface AdyenPaymentMethod {
  encryptedCardNumber: string;
  encryptedExpiryMonth: string;
  encryptedExpiryYear: string;
  encryptedSecurityCode: string;
  type: string;
}

export interface AdyenEventData {
  isValid: boolean;
  data: {
    browserInfo: {
      acceptHeader: string;
      colorDepth: string;
      language: string;
      javaEnabled: boolean;
      screenHeight: string;
      screenWidth: string;
      userAgent: string;
      timeZoneOffset: number;
    };
    paymentMethod: AdyenPaymentMethod;
    billingAddress?: {
      street: string;
      houseNumberOrName: string;
      postalCode: string;
      city: string;
      country: string;
      stateOrProvince: string;
    };
  };
}

export interface AdyenAdditionalEventData {
  isValid: boolean;
  data: {
    details: unknown;
  };
}

// currently only card payments with Adyen are supported
export const adyenPaymentMethods = ['card'] as const;

export type AdyenPaymentMethodType = (typeof adyenPaymentMethods)[number];
