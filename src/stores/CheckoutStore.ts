import type { Offer, Order, PaymentMethod } from '#types/checkout';
import { createStore } from '#src/stores/utils';

type CheckoutStore = {
  offer: Offer | null;
  order: Order | null;
  paymentMethods: PaymentMethod[] | null;
  setOffer: (offer: Offer | null) => void;
  setOrder: (order: Order | null) => void;
  setPaymentMethods: (paymentMethods: PaymentMethod[] | null) => void;
};

export const useCheckoutStore = createStore<CheckoutStore>('CheckoutStore', (set) => ({
  offer: null,
  order: null,
  paymentMethods: null,
  setOffer: (offer) => set({ offer }),
  setOrder: (order) => set({ order }),
  setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
}));
