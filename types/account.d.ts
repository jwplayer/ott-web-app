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

export type RegistrationFormData = {
  email: string;
  password: string;
  termsConditions: boolean;
  emailUpdates: boolean;
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

type Login = CleengRequest<LoginPayload, AuthData>;
type Register = CleengRequest<RegisterPayload, AuthData>;
type ResetPassword = CleengRequest<ResetPasswordPayload, Record<string, unknown>>;
type ChangePassword = CleengRequest<ChangePasswordPayload, Record<string, unknown>>;
type GetCustomer = CleengAuthRequest<GetCustomerPayload, Customer>;
type UpdateCustomer = CleengAuthRequest<UpdateCustomerPayload, Customer>;
