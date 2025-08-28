// Cleeng typings for API models

export interface CleengCustomer {
  id: string;
  email: string;
  country: string;
  regDate: string;
  lastLoginDate?: string;
  lastUserIp: string;
  firstName?: string;
  lastName?: string;
  externalId?: string;
  externalData?: Record<string, unknown>;
}

export interface UpdateConfirmation {
  success: boolean;
}

export interface LocalesData {
  country: string;
  currency: string;
  locale: string;
  ipAddress: string;
}

export interface PublisherConsent {
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  version: string;
  value: string;
}

export interface CustomerConsent {
  customerId: string;
  date: number;
  label: string;
  name: string;
  needsUpdate: boolean;
  newestVersion: string;
  required: boolean;
  state: 'accepted' | 'declined';
  value: string | boolean;
  version: string;
}
