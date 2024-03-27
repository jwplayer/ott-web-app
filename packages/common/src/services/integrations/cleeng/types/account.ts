import type { AuthData } from '../../../../../types/account';

import type { Response } from './api';
import type { CleengCustomer, LocalesData, PublisherConsent, CustomerConsent, UpdateConfirmation } from './models';

// Cleeng typings for the account endpoints

// Auth
export type AuthResponse = Response<AuthData>;

// Customer
export type GetCustomerResponse = Response<CleengCustomer>;
export type UpdateCustomerResponse = Response<CleengCustomer>;

// Consents
export type UpdateConsentsResponse = Response<UpdateConfirmation>;
export type GetPublisherConsentsResponse = Response<{ consents: PublisherConsent[] }>;
export type GetCustomerConsentsResponse = Response<{ consents: CustomerConsent[] }>;

// Locales
export type GetLocalesResponse = Response<LocalesData>;
