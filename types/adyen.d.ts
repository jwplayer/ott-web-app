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
    paymentMethod: AdyenPaymentMethod;
  };
}

interface AdyenConfiguration {
  onSubmit: (data: AdyenEventData) => void;
  onChange: (data: AdyenEventData) => void;
  showPayButton: boolean;
  environment: 'test' | 'live';
  clientKey: string;
}

interface AdyenCheckout {
  create: (method: string) => AdyenCheckout;
  mount: (selector: string) => AdyenCheckout;
  submit: () => void;
  unmount: () => AdyenCheckout;
}

interface AdyenCheckoutStatic {
  (configuration: AdyenConfiguration): AdyenCheckout;
}
