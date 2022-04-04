// noinspection JSUnusedGlobalSymbols
interface Window {
  configLocation: configLocation;
  configId: string;
  jwplayer?: jwplayer.JWPlayerStatic;
  jwpltx: Jwpltx;
  AdyenCheckout: Adyen.AdyenCheckoutStatic;
}

declare const NODE_ENV_COMPILE_CONST: 'production' | 'development' | 'undefined';

interface HTMLDivElement {
  inert: boolean;
}
