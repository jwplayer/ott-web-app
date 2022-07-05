import type { SerializedWatchHistoryItem } from './watchHistory';
import type { SerializedFavorite } from './favorite';

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

export type LoginPayload = {
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
  password: string;
};

export type OfferType = 'svod' | 'tvod';

export type ChooseOfferFormData = {
  offerId?: string;
};

export type RegisterPayload = {
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

export type RefreshTokenPayload = {
  refreshToken: string;
};

export type Customer = {
  id: string;
  email: string;
  country: string;
  regDate: string;
  lastLoginDate?: string;
  lastUserIp: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  externalData?: ExternalData;
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

export type UpdateCaptureAnswersPayload = {
  customerId: string;
} & Capture;

type Login = CleengRequest<LoginPayload, AuthData>;
type Register = CleengRequest<RegisterPayload, AuthData>;
type GetPublisherConsents = CleengRequest<GetPublisherConsentsPayload, GetPublisherConsentsResponse>;
type GetCustomerConsents = CleengAuthRequest<GetCustomerConsentsPayload, GetCustomerConsentsResponse>;
type ResetPassword = CleengRequest<ResetPasswordPayload, Record<string, unknown>>;
type ChangePassword = CleengRequest<ChangePasswordPayload, Record<string, unknown>>;
type GetCustomer = CleengAuthRequest<GetCustomerPayload, Customer>;
type UpdateCustomer = CleengAuthRequest<UpdateCustomerPayload, Customer>;
type UpdateCustomerConsents = CleengAuthRequest<UpdateCustomerConsentsPayload, never>;
type RefreshToken = CleengRequest<RefreshTokenPayload, AuthData>;
type GetLocales = CleengEmptyRequest<LocalesData>;
type GetCaptureStatus = CleengAuthRequest<GetCaptureStatusPayload, GetCaptureStatusResponse>;
type UpdateCaptureAnswers = CleengAuthRequest<UpdateCaptureAnswersPayload, Capture>;
