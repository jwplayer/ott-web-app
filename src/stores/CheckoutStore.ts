import type { Offer, Order, PaymentMethod } from '#types/checkout';
import type { MediaOffer } from '#types/media';
import { createStore } from '#src/stores/utils';
import type { OfferType } from '#types/account';

type CheckoutStore = {
  offer: Offer | null;
  offerType: OfferType | null;
  order: Order | null;
  paymentMethods: PaymentMethod[] | null;
  requestedMediaOffers: MediaOffer[] | null;
  setOffer: (offer: Offer | null) => void;
  setOfferType: (offerType: OfferType | null) => void;
  setOrder: (order: Order | null) => void;
  setPaymentMethods: (paymentMethods: PaymentMethod[] | null) => void;
  setRequestedMediaOffers: (requestedMediaOffers: MediaOffer[] | null) => void;
};

export const useCheckoutStore = createStore<CheckoutStore>('CheckoutStore', (set) => ({
  offer: null,
  offerType: null,
  order: null,
  paymentMethods: null,
  requestedMediaOffers: null,
  setOffer: (offer) => set({ offer }),
  setOfferType: (offerType) => set({ offerType }),
  setOrder: (order) => set({ order }),
  setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
  setRequestedMediaOffers: (requestedMediaOffers) => set({ requestedMediaOffers }),
}));
