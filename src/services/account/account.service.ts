import type { Config } from '#types/Config';
import type {
  ChangePassword,
  GetCustomer,
  GetCustomerConsents,
  GetPublisherConsents,
  Login,
  Register,
  ResetPassword,
  UpdateCustomer,
  UpdateCustomerConsents,
  GetCaptureStatus,
  UpdateCaptureAnswers,
  AuthData,
  SocialURLSData,
  GetLocales,
  ChangePasswordWithOldPassword,
  UpdatePersonalShelves,
  ExportAccountData,
  NotificationsData,
  DeleteAccount,
  Customer,
  CustomerConsent,
} from '#types/account';

export default interface AccountService {
  canUpdateEmail: boolean;
  canSupportEmptyFullName: boolean;
  canChangePasswordWithOldPassword: boolean;
  canRenewSubscription: boolean;
  canExportAccountData: boolean;
  canDeleteAccount: boolean;
  canUpdatePaymentMethod: boolean;
  canShowReceipts: boolean;

  initialize: (config: Config, logoutCallback: () => Promise<void>) => void;

  getAuthData: () => Promise<AuthData | null>;

  login: Login;

  register: Register;

  logout: () => void;

  getUser: ({ config }: { config: Config }) => Promise<{ user: Customer; customerConsents: CustomerConsent[] }>;

  getPublisherConsents: GetPublisherConsents;

  getCustomerConsents: GetCustomerConsents;

  updateCustomerConsents: UpdateCustomerConsents;

  getCaptureStatus: GetCaptureStatus;

  updateCaptureAnswers: UpdateCaptureAnswers;
  resetPassword: ResetPassword;

  changePasswordWithResetToken: ChangePassword;

  changePasswordWithOldPassword: ChangePasswordWithOldPassword;

  updateCustomer: UpdateCustomer;

  updatePersonalShelves: UpdatePersonalShelves;

  subscribeToNotifications: NotificationsData;

  exportAccountData: ExportAccountData;

  getSocialUrls: SocialURLSData;

  deleteAccount: DeleteAccount;

  getLocales: GetLocales;

  getCustomer: GetCustomer;
}
