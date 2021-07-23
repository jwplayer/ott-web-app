export type AuthData = {
  jwt: string;
  customerToken: string;
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

export type Customer = {
  id: string;
  email: string;
  locale: string;
  country: string;
  currency: string;
  lastUserIp: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  externalData?: string;
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

type Login = CleengRequest<LoginPayload, AuthData>;
type Register = CleengRequest<RegisterPayload, AuthData>;
type GetPublisherConsents = CleengRequest<GetPublisherConsentsPayload, Record<string, Consent[]>>;
type GetCustomerConsents = CleengAuthRequest<GetCustomerConsentsPayload, Record<string, CustomerConsent[]>>;
type ResetPassword = CleengRequest<ResetPasswordPayload, Record<string, unknown>>;
type ChangePassword = CleengRequest<ChangePasswordPayload, Record<string, unknown>>;
type GetCustomer = CleengAuthRequest<GetCustomerPayload, Customer>;
type UpdateCustomer = CleengAuthRequest<UpdateCustomerPayload, Customer>;
