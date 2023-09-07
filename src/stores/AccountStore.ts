import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';
import type { Consent, Customer, CustomerConsent } from '#types/account';
import { createStore } from '#src/utils/createStore';
import type { Offer } from '#types/checkout';

type AccountStore = {
  loading: boolean;
  user: Customer | null;
  subscription: Subscription | null;
  transactions: Transaction[] | null;
  activePayment: PaymentDetail | null;
  customerConsents: CustomerConsent[] | null;
  publisherConsents: Consent[] | null;
  pendingOffer: Offer | null;
  canUpdateEmail: boolean;
  canRenewSubscription: boolean;
  canUpdatePaymentMethod: boolean;
  canChangePasswordWithOldPassword: boolean;
  canExportAccountData: boolean;
  canDeleteAccount: boolean;
  canShowReceipts: boolean;
  setLoading: (loading: boolean) => void;
  getAccountInfo: () => { customerId: string; customer: Customer; customerConsents: CustomerConsent[] | null };
};

export const useAccountStore = createStore<AccountStore>('AccountStore', (set, get) => ({
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
  getAccountInfo: () => {
    const user = get().user;
    const customerConsents = get().customerConsents;

    if (!user?.id) throw new Error('user not logged in');

    return { customerId: user?.id, customer: user, customerConsents };
  },
}));
