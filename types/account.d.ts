import type { SerializedWatchHistoryItem } from './watchHistory';
import type { SerializedFavorite } from './favorite';

import type { Config } from '#types/Config';

export type AuthData = {
  jwt: string;
  customerToken: string;
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

export type RefreshTokenPayload = {
  refreshToken: string;
};

export type AuthArgs = {
  config: Config;
  email: string;
  password: string;
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

export type EditPasswordFormData = {
  email?: string;
  oldPassword?: string;
  password: string;
  passwordConfirmation: string;
  resetPasswordToken?: string;
};

export type OfferType = 'svod' | 'tvod';

export type ChooseOfferFormData = {
  offerId?: string;
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

export type RegisterArgs = {
  config: Config;
  user: RegisterPayload;
};
export type CaptureFirstNameLastName = {
  firstName: string;
  lastName: string;
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

export type GetPublisherConsentsPayload = {
  publisherId: string;
};

export type GetPublisherConsentsResponse = {
  consents: Consent[];
};

export type GetCustomerConsentsPayload = {
  customerId: string;
};

export type GetCustomerConsentsResponse = {
  consents: CustomerConsent[];
};

export type ResetPasswordPayload = {
  customerEmail: string;
  offerId?: string;
  publisherId?: string;
  resetUrl?: string;
};

export type ChangePasswordPayload = {
  customerEmail: string;
  publisherId: string;
  resetPasswordToken: string;
  newPassword: string;
};

export type ChangePasswordWithTokenPayload = {
  customerEmail?: string;
  publisherId?: string;
  resetPasswordToken: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

export type changePasswordWithOldPasswordPayload = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

export type GetCustomerPayload = {
  customerId: string;
};

export type UpdateCustomerPayload = {
  id?: string;
  email?: string;
  confirmationPassword?: string;
  firstName?: string;
  lastName?: string;
  externalData?: ExternalData;
};

export type ExternalData = {
  history?: SerializedWatchHistoryItem[];
  favorites?: SerializedFavorite[];
};

export type UpdateCustomerConsentsPayload = {
  id?: string;
  consents: CustomerConsent[];
};

export type Customer = {
  id: string;
  email: string;
  country: string;
  regDate: string;
  lastLoginDate?: string;
  lastUserIp: string;
  firstName?: string;
  metadata?: Record<string, unknown>;
  lastName?: string;
  fullName?: string;
  externalId?: string;
  externalData?: ExternalData;
};

export type UpdateCustomerArgs = {
  id?: string | undefined;
  email?: string | undefined;
  confirmationPassword?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  externalData?: ExternalData | undefined;
  metadata?: Record<string>;
  fullName?: string;
};

export type Consent = {
  broadcasterId: number;
  name: string;
  version: string;
  value: string;
  label: string;
  enabledByDefault: boolean;
  required: boolean;
};
export type CustomerConsent = {
  customerId?: string;
  date?: number;
  label?: string;
  name: string;
  needsUpdate?: boolean;
  newestVersion?: string;
  required?: boolean;
  state: 'accepted' | 'declined';
  value?: string;
  version: string;
};

export type CustomerConsentArgs = {
  config: Config;
  jwt: string;
  customerId?: string;
  customer?: Customer;
};

export type UpdateCustomerConsentsArgs = {
  jwt: string;
  config: Config;
  customer: Customer;
  consents: CustomerConsent[];
};

export type LocalesData = {
  country: string;
  currency: string;
  locale: string;
  ipAddress: string;
};

export type GetCaptureStatusPayload = {
  customerId: string;
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

interface ApiResponse {
  errors: string[];
}

type ServiceResponse<R> = { responseData: R } & ApiResponse;
type Request<P, R> = (payload: P) => Promise<R>;
type EmptyServiceRequest<R> = (sandbox: boolean) => Promise<ServiceResponse<R>>;
type ServiceRequest<P, R> = (payload: P) => Promise<ServiceResponse<R>>;
type EnvironmentServiceRequest<P, R> = (payload: P, sandbox: boolean) => Promise<ServiceResponse<R>>;
type AuthRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<R>;
type AuthServiceRequest<P, R> = (payload: P, sandbox: boolean, jwt: string) => Promise<ServiceResponse<R>>;

type Login = Request<AuthArgs, AuthResponse>;
type Register = Request<AuthArgs, AuthResponse>;
type GetCustomer = AuthServiceRequest<GetCustomerPayload, Customer>;
type UpdateCustomer = AuthServiceRequest<UpdateCustomerArgs, Customer>;
type GetPublisherConsents = Request<Config, GetPublisherConsentsResponse>;
type GetCustomerConsents = Request<CustomerConsentArgs, GetCustomerConsentsResponse>;
type UpdateCustomerConsents = Request<UpdateCustomerConsentsArgs, GetCustomerConsentsResponse>;
type GetCaptureStatus = AuthServiceRequest<GetCaptureStatusArgs, GetCaptureStatusResponse>;
type UpdateCaptureAnswers = AuthServiceRequest<UpdateCaptureStatusArgs, Capture>;
type ResetPassword = EnvironmentServiceRequest<ResetPasswordPayload, Record<string, unknown>>;
type ChangePassword = EnvironmentServiceRequest<ChangePasswordWithTokenPayload, ApiResponse<unknown>>;
type ChangePasswordWithOldPassword = EnvironmentServiceRequest<ChangePasswordWithOldPasswordPayload, ApiResponse<unknown>>;
type RefreshToken = EnvironmentServiceRequest<RefreshTokenPayload, AuthData>;
type GetLocales = EmptyServiceRequest<LocalesData>;
