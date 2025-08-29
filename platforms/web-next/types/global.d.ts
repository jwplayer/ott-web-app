declare global {
  const __dev__: boolean;
  const __mode__: string;
  const __debug__: boolean;
  
  type AdyenPaymentMethodType = any;
  type AdyenEventData = any;
  type AdyenAdditionalEventData = any;
}

declare module '@adyen/adyen-web/dist/types/components' {
  const components: any;
  export default components;
}

declare module '@adyen/adyen-web/dist/types/components/Dropin/Dropin' {
  const DropinElement: any;
  export default DropinElement;
}

declare module '@adyen/adyen-web/dist/types/core/types' {
  const types: any;
  export default types;
}

declare module '@adyen/adyen-web/dist/types/types' {
  const types: any;
  export default types;
}

export {};
