import type { PaymentDetail, Subscription, Transaction } from '#types/subscription';
import type { Consent, CustomerConsent } from '#types/account';
import { createStore } from '#src/stores/utils';
import type { AccountDetails } from '#types/app';

type AccountStore = {
  loading: boolean;
  user: AccountDetails | null;
  subscription: Subscription | null;
  transactions: Transaction[] | null;
  activePayment: PaymentDetail | null;
  customerConsents: CustomerConsent[] | null;
  publisherConsents: Consent[] | null;
  canUpdateEmail: boolean;
  canRenewSubscription: boolean;
  canChangePasswordWithOldPassword: boolean;
  setLoading: (loading: boolean) => void;
};

export const useAccountStore = createStore<AccountStore>('AccountStore', (set) => ({
  loading: true,
  auth: null,
  user: null,
  subscription: null,
  transactions: null,
  activePayment: null,
  customerConsents: null,
  publisherConsents: null,
  canUpdateEmail: false,
  canRenewSubscription: false,
  canChangePasswordWithOldPassword: false,
  setLoading: (loading: boolean) => set({ loading }),
}));
