import { createStore } from '#src/stores/utils';

type FeaturesStore = {
  hasAccount: boolean;
  hasNotifications: boolean;
  canUpdateEmail: boolean;
  canRenewSubscription: boolean;
  canUpdatePaymentMethod: boolean;
  canChangePasswordWithOldPassword: boolean;
  canExportAccountData: boolean;
  canDeleteAccount: boolean;
  canShowReceipts: boolean;
  canManageProfiles: boolean;
};

export const useFeaturesStore = createStore<FeaturesStore>('FeaturesStore', () => ({
  hasAccount: false,
  hasNotifications: false,
  hasProfiles: false,
  canUpdateEmail: false,
  canRenewSubscription: false,
  canChangePasswordWithOldPassword: false,
  canExportAccountData: false,
  canDeleteAccount: false,
  canUpdatePaymentMethod: false,
  canShowReceipts: false,
  canManageProfiles: false,
}));
