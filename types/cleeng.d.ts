import type { ExternalData } from '#types/account';

type CleengResponse<R> = { responseData: R, errors: [] };

type CleengDirectResponse<R> = R;

type CleengParams = { publisherId?: string; sandbox: boolean; jwt?: string; };
type WithCleengParams<R> = R & CleengParams;

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

export type LoginPayload = PayloadWithIPOverride & {
  email: string;
  password: string;
  offerId?: string;
  publisherId?: string;
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
  uuid?: string;
  externalId?: string;
  externalData?: ExternalData;
};

export type LocalesData = {
  country: string;
  currency: string;
  locale: string;
  ipAddress: string;
};
