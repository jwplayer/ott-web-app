interface AdyenPaymentMethod {
  encryptedCardNumber: string;
  encryptedExpiryMonth: string;
  encryptedExpiryYear: string;
  encryptedSecurityCode: string;
  type: string;
}

interface AdyenEventData {
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

interface AdyenConfiguration {
  onSubmit: (data: AdyenEventData) => void;
  onChange: (data: AdyenEventData) => void;
  showPayButton: boolean;
  environment: 'test' | 'live';
  clientKey: string;
}

interface AdyenAdditionalEventData {
  isValid: boolean;
  data: {
    details: unknown;
  };
}

interface AdyenCheckoutStatic {
  (configuration: AdyenConfiguration): AdyenCheckout;
}

// currently only card payments with Adyen are supported
const adyenPaymentMethods = ['card'] as const;

type AdyenPaymentMethodType = (typeof adyenPaymentMethods)[number];
