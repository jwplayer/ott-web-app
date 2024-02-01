import type { Config } from './config';
import type { PromiseRequest } from './service';
import type { SerializedWatchHistoryItem } from './watchHistory';
import type { SerializedFavorite } from './favorite';

export type AuthData = {
  jwt: string;
  refreshToken: string;
};

export type JwtDetails = {
  customerId: string;
  exp: number;
  publisherId: number;
};

export type PayloadWithIPOverride = {
  customerIP?: string;
};

export type LoginArgs = {
  email: string;
  password: string;
  referrer: string;
};

export type RegistrationArgs = LoginArgs & {
  consents: CustomerConsent[];
};

export type AuthResponse = {
  auth: AuthData;
  user: Customer;
  customerConsents: CustomerConsent[];
};

export type LoginPayload = PayloadWithIPOverride & {
  email: string;
  password: string;
  offerId?: string;
  publisherId?: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegistrationFormData = {
  email: string;
  password: string;
};

export type ForgotPasswordFormData = {
  email: string;
};

export type DeleteAccountFormData = {
  password: string;
};

export type EditPasswordFormData = {
  email?: string;
  oldPassword?: string;
  password: string;
  passwordConfirmation: string;
  resetPasswordToken?: string;
};

export type GetUserArgs = {
  config: Config;
};

export type GetUserPayload = {
  user: Customer;
  customerConsents: CustomerConsent[];
};

export type RegisterPayload = PayloadWithIPOverride & {
  email: string;
  password: string;
  offerId?: string;
  publisherId?: string;
  locale: string;
  country: string;
  currency: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  externalData?: string;
};

export type CleengCaptureField = {
  key: string;
  enabled: boolean;
  required: boolean;
  answer: string | Record<string, string | null> | null;
};

export type CleengCaptureQuestionField = {
  key: string;
  enabled: boolean;
  required: boolean;
  value: string;
  question: string;
  answer: string | null;
};

export type PersonalDetailsFormData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  companyName: string;
  phoneNumber: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  postCode: string;
  country: string;
};

export type GetCustomerConsentsResponse = {
  consents: CustomerConsent[];
};

export type ResetPasswordPayload = {
  customerEmail: string;
  offerId?: string;
  resetUrl?: string;
};

export type ChangePasswordWithTokenPayload = {
  customerEmail?: string;
  resetPasswordToken: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

export type ChangePasswordWithOldPasswordPayload = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

export type UpdateCustomerPayload = {
  id?: string;
  email?: string;
  confirmationPassword?: string;
  firstName?: string;
  lastName?: string;
};

export type UpdateCustomerConsentsPayload = {
  id?: string;
  consents: CustomerConsent[];
};

export type Customer = {
  id: string;
  email: string;
  firstName?: string;
  country?: string;
  metadata: Record<string, unknown>;
  lastName?: string;
  fullName?: string;
  [key: string]: unknown;
};

export type UpdateCustomerArgs = {
  id?: string | undefined;
  email?: string | undefined;
  confirmationPassword?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  metadata?: Record<string, unknown>;
  fullName?: string;
};

export type CustomRegisterFieldVariant = 'input' | 'select' | 'country' | 'us_state' | 'radio' | 'checkbox' | 'datepicker';

export interface CustomFormField {
  type: CustomRegisterFieldVariant;
  isCustomRegisterField?: boolean;
  enabledByDefault?: boolean;
  defaultValue?: string;
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: Record<string, string>;
  version: string;
}

export type CustomerConsent = {
  customerId?: string;
  date?: number;
  label?: string;
  name: string;
  needsUpdate?: boolean;
  newestVersion?: string;
  required?: boolean;
  state: 'accepted' | 'declined';
  value?: string | boolean;
  version: string;
};

export type CustomerConsentArgs = {
  customer: Customer;
};

export type UpdateCustomerConsentsArgs = {
  customer: Customer;
  consents: CustomerConsent[];
};

export type GetCaptureStatusResponse = {
  isCaptureEnabled: boolean;
  shouldCaptureBeDisplayed: boolean;
  settings: Array<CleengCaptureField | CleengCaptureQuestionField>;
};

export type CaptureCustomAnswer = {
  questionId: string;
  question: string;
  value: string;
};

export type Capture = {
  firstName?: string;
  address?: string;
  address2?: string;
  city?: string;
  state?: string;
  postCode?: string;
  country?: string;
  birthDate?: string;
  companyName?: string;
  phoneNumber?: string;
  customAnswers?: CaptureCustomAnswer[];
};

export type GetCaptureStatusArgs = {
  customer: Customer;
};

export type UpdateCaptureStatusArgs = {
  customer: Customer;
} & Capture;

export type UpdateCaptureAnswersPayload = {
  customerId: string;
} & Capture;

export type FirstLastNameInput = {
  firstName: string;
  lastName: string;
  metadata?: Record<string, string | boolean>;
};

export type EmailConfirmPasswordInput = {
  email: string;
  confirmationPassword: string;
};

export type CommonAccountResponse = {
  message: string;
  code: number;
  errors?: Record<string, string>;
};

export type DeleteAccountPayload = {
  password: string;
};

export type SubscribeToNotificationsPayload = {
  uuid: string;
  onMessage: (payload: string) => void;
};

export type GetSocialURLsPayload = {
  redirectUrl: string;
};

export type SocialURLs =
  | {
      facebook: string;
    }
  | {
      twitter: string;
    }
  | {
      google: string;
    };

export type UpdateWatchHistoryArgs = {
  user: Customer;
  history: SerializedWatchHistoryItem[];
};

export type UpdateFavoritesArgs = {
  user: Customer;
  favorites: SerializedFavorite[];
};

export type GetFavoritesArgs = {
  user: Customer;
};

export type GetWatchHistoryArgs = {
  user: Customer;
};

export type GetAuthData = () => Promise<AuthData | null>;
export type Login = PromiseRequest<LoginArgs, AuthResponse>;
export type Register = PromiseRequest<RegistrationArgs, AuthResponse>;
export type GetUser = PromiseRequest<GetUserArgs, GetUserPayload>;
export type Logout = () => Promise<void>;
export type UpdateCustomer = PromiseRequest<UpdateCustomerArgs, Customer>;
export type GetPublisherConsents = PromiseRequest<Config, CustomFormField[]>;
export type GetCustomerConsents = PromiseRequest<CustomerConsentArgs, CustomerConsent[]>;
export type UpdateCustomerConsents = PromiseRequest<UpdateCustomerConsentsArgs, CustomerConsent[]>;
export type GetCaptureStatus = PromiseRequest<GetCaptureStatusArgs, GetCaptureStatusResponse>;
export type UpdateCaptureAnswers = PromiseRequest<UpdateCaptureStatusArgs, Customer>;
export type ResetPassword = PromiseRequest<ResetPasswordPayload, void>;
export type ChangePassword = PromiseRequest<ChangePasswordWithTokenPayload, void>;
export type ChangePasswordWithOldPassword = PromiseRequest<ChangePasswordWithOldPasswordPayload, void>;
export type GetSocialURLs = PromiseRequest<GetSocialURLsPayload, SocialURLs[]>;
export type NotificationsData = PromiseRequest<SubscribeToNotificationsPayload, boolean>;
export type UpdateWatchHistory = PromiseRequest<UpdateWatchHistoryArgs, void>;
export type UpdateFavorites = PromiseRequest<UpdateFavoritesArgs, void>;
export type GetWatchHistory = PromiseRequest<GetWatchHistoryArgs, SerializedWatchHistoryItem[]>;
export type GetFavorites = PromiseRequest<GetFavoritesArgs, SerializedFavorite[]>;
export type ExportAccountData = PromiseRequest<undefined, CommonAccountResponse>;
export type DeleteAccount = PromiseRequest<DeleteAccountPayload, CommonAccountResponse>;
