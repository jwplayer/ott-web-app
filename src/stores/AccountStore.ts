import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';
import type { Consent, Customer, CustomerConsent } from '#types/account';
import { createStore } from '#src/stores/utils';
import type { Offer } from '#types/checkout';
import type { ConsentFieldVariants } from '#src/services/inplayer.account.service';

type AccountStore<T = string> = {
  loading: boolean;
  user: Customer | null;
  subscription: Subscription | null;
  transactions: Transaction[] | null;
  activePayment: PaymentDetail | null;
  customerConsents: CustomerConsent[] | null;
  publisherConsents: Consent<T>[] | null;
  pendingOffer: Offer | null;
  canUpdateEmail: boolean;
  canRenewSubscription: boolean;
  canUpdatePaymentMethod: boolean;
  canChangePasswordWithOldPassword: boolean;
  canExportAccountData: boolean;
  canDeleteAccount: boolean;
  canShowReceipts: boolean;
  setLoading: (loading: boolean) => void;
};

export const useAccountStore = createStore<AccountStore<ConsentFieldVariants>>('AccountStore', (set) => ({
  loading: true,
  user: null,
  subscription: null,
  transactions: null,
  activePayment: null,
  customerConsents: null,
  publisherConsents: null,
  pendingOffer: null,
  canUpdateEmail: false,
  canRenewSubscription: false,
  canChangePasswordWithOldPassword: false,
  canExportAccountData: false,
  canDeleteAccount: false,
  canUpdatePaymentMethod: false,
  canShowReceipts: false,
  setLoading: (loading: boolean) => set({ loading }),
}));
