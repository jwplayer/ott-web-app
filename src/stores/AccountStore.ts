import { createStore } from '#src/stores/utils';
import type { Consent, Customer, CustomerConsent } from '#types/account';
import type { Offer } from '#types/checkout';
import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';

type Features = {
  hasIntegration: boolean;
  hasSocialURLs: boolean;
  hasNotifications: boolean;
  hasProfiles: boolean;
  canUpdateEmail: boolean;
  canRenewSubscription: boolean;
  canUpdatePaymentMethod: boolean;
  canChangePasswordWithOldPassword: boolean;
  canSupportEmptyFullName: boolean;
  canExportAccountData: boolean;
  canDeleteAccount: boolean;
  canShowReceipts: boolean;
};

type AccountStore = {
  loading: boolean;
  user: Customer | null;
  subscription: Subscription | null;
  transactions: Transaction[] | null;
  activePayment: PaymentDetail | null;
  customerConsents: CustomerConsent[] | null;
  publisherConsents: Consent[] | null;
  pendingOffer: Offer | null;
  features: Features;
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
  setLoading: (loading: boolean) => set({ loading }),
  getAccountInfo: () => {
    const user = get().user;
    const customerConsents = get().customerConsents;

    if (!user?.id) throw new Error('user not logged in');

    return { customerId: user?.id, customer: user, customerConsents };
  },
  features: {
    hasIntegration: false, // JW or Cleeng
    hasNotifications: false,
    hasSocialURLs: false,
    hasProfiles: false,
    canUpdateEmail: false,
    canRenewSubscription: false,
    canSupportEmptyFullName: false,
    canChangePasswordWithOldPassword: false,
    canExportAccountData: false,
    canDeleteAccount: false,
    canUpdatePaymentMethod: false,
    canShowReceipts: false,
  },
}));
