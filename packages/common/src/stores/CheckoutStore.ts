import type { Offer, Order, PaymentMethod } from '../../types/checkout';
import type { MediaOffer } from '../../types/media';

import { createStore } from './utils';

type CheckoutStore = {
  requestedMediaOffers: MediaOffer[];
  offersMedia: Offer[];
  offersSubscription: Offer[];
  offersSwitchSubscription: Offer[];
  selectedOffer: Offer | null;
  defaultOfferId: string | null;
  order: Order | null;
  paymentMethods: PaymentMethod[] | null;
  setRequestedMediaOffers: (requestedMediaOffers: MediaOffer[]) => void;
  setOrder: (order: Order | null) => void;
  setPaymentMethods: (paymentMethods: PaymentMethod[] | null) => void;
};

export const useCheckoutStore = createStore<CheckoutStore>('CheckoutStore', (set) => ({
  requestedMediaOffers: [],
  offersMedia: [],
  offersSubscription: [],
  offersSwitchSubscription: [],
  selectedOffer: null,
  defaultOfferId: null,
  order: null,
  paymentMethods: null,
  setRequestedMediaOffers: (requestedMediaOffers) => set({ requestedMediaOffers }),
  setOrder: (order) => set({ order }),
  setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
}));
