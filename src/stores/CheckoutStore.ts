import type { Offer, Order, PaymentMethod } from '#types/checkout';
import type { MediaOffer } from '#types/media';
import { createStore } from '#src/stores/utils';

type CheckoutStore = {
  offer: Offer | null;
  order: Order | null;
  paymentMethods: PaymentMethod[] | null;
  requestedMediaOffers: MediaOffer[] | null;
  offerSwitches: Offer[];
  updateOffer: (offer: Offer | null) => void;
  setOffer: (offer: Offer | null) => void;
  setOrder: (order: Order | null) => void;
  setPaymentMethods: (paymentMethods: PaymentMethod[] | null) => void;
  setRequestedMediaOffers: (requestedMediaOffers: MediaOffer[] | null) => void;
};

export const useCheckoutStore = createStore<CheckoutStore>('CheckoutStore', (set) => ({
  offer: null,
  order: null,
  paymentMethods: null,
  requestedMediaOffers: null,
  offerSwitches: [],
  updateOffer: (offer) => set({ offer: offer }),
  setOffer: (offer) => set({ offer }),
  setOrder: (order) => set({ order }),
  setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
  setRequestedMediaOffers: (requestedMediaOffers) => set({ requestedMediaOffers }),
}));
