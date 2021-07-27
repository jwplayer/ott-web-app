export type AuthData = {
  jwt: string;
  customerToken: string;
  refreshToken: string;
};

export type JwtDetails = {
  customerId: number;
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
  termsConditions: boolean;
  emailUpdates: boolean;
};

export type OfferPeriodicity = 'monthly' | 'yearly';

export type ChooseOfferFormData = {
  periodicity: OfferPeriodicity;
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

export type PersonalDetailsCustomField = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'radio' | 'checkbox' | 'date';
  value?: string;
  values?: string[];
  question?: string;
  validationType?: string;
  validations: Record<string, unknown>[] | null;
};

export type PersonalDetailsFormData = {
  firstName?: string;
  lastName?: string;
  birthday?: string;
  companyName?: string;
  phoneNumber?: number;
  address?: string;
  city?: string;
  region?: string;
  zipCode?: string;
  [key: string]: string;
};

export type GetPublisherConsentsPayload = {
  publisherId: string;
};

export type GetCustomerConsentsPayload = {
  customerId: string;
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
};

export type UpdateCustomerConsentsPayload = {
  id?: string;
  consents: CustomerConsent[];
};

export type RefreshTokenPayload = {
  refreshToken: string;
};

export type Customer = {
  id: number;
  email: string;
  country: string;
  regDate: string;
  lastLoginDate?: string;
  lastUserIp: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  externalData?: Record<string, unknown>;
};

export type Consent = {
  broadcasterId: number;
  name: string;
  version: string;
  value: string;
  label: string;
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

type Login = CleengRequest<LoginPayload, AuthData>;
type Register = CleengRequest<RegisterPayload, AuthData>;
type GetPublisherConsents = CleengRequest<GetPublisherConsentsPayload, Record<string, Consent[]>>;
type GetCustomerConsents = CleengAuthRequest<GetCustomerConsentsPayload, Record<string, CustomerConsent[]>>;
type ResetPassword = CleengRequest<ResetPasswordPayload, Record<string, unknown>>;
type ChangePassword = CleengRequest<ChangePasswordPayload, Record<string, unknown>>;
type GetCustomer = CleengAuthRequest<GetCustomerPayload, Customer>;
type UpdateCustomer = CleengAuthRequest<UpdateCustomerPayload, Customer>;
type UpdateCustomerConsents = CleengAuthRequest<UpdateCustomerConsentsPayload, Customer>;
type RefreshToken = CleengRequest<RefreshTokenPayload, AuthData>;
type GetLocales = CleengEmptyRequest<LocalesData>;
