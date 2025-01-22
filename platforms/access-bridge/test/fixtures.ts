import Stripe from 'stripe';
import { Plan } from '@jwp/ott-common/types/plans.js';
import { Price, Product } from '@jwp/ott-common/types/payment.js';

import { Viewer } from '../src/services/identity-service';
import { ErrorDefinitions } from '../src/errors.js';

// Utility function to get Unix timestamp
export const getTimestamp = (daysOffset: number): number => {
  const now = new Date();
  now.setDate(now.getDate() + daysOffset);
  return Math.floor(now.getTime() / 1000);
};

// Precompute timestamps
const FUTURE_EXPIRY = getTimestamp(30); // 30 days from now
const PAST_EXPIRY = getTimestamp(-30); // 30 days ago

// API endpoints constant
export const ENDPOINTS = {
  GENERATE_PASSPORT: '/v2/sites/:site_id/access/generate',
  REFRESH_PASSPORT: '/v2/sites/:site_id/access/refresh',
  PRODUCTS: '/v2/sites/:site_id/products',
  CHECKOUT: '/v2/sites/:site_id/checkout',
  BILLING_PORTAL: '/v2/sites/:site_id/billing-portal',
};

// mock data for access tokens
export const ACCESS_TOKENS = {
  PASSPORT: {
    VALID: 'valid-passport',
    INVALID: 'invalid-passport',
  },
  REFRESH_TOKEN: {
    VALID: 'valid-refresh-token',
    INVALID: 'invalid-refresh-token',
  },
};

export const VALID_PLAN_ID = 'plan1234';
export const VIEWER: Viewer = {
  id: '123456',
  email: 'dummy@test.com',
};

// Plan mock creation function
const createMockPlan = ({ id, original_id, exp, metadata }: Plan): Plan => ({
  id,
  original_id,
  exp,
  metadata: {
    name: metadata.name || '',
    access: {
      drm_policy_id: metadata.access.drm_policy_id,
      include_tags: metadata.access.include_tags || [],
      exclude_tags: metadata.access.exclude_tags || [],
      include_custom_params: metadata.access.include_custom_params || [],
      exclude_custom_params: metadata.access.exclude_custom_params || [],
    },
    access_model: metadata.access_model,
    external_providers: metadata.external_providers || {},
  },
});

export const PLANS = {
  VALID: [
    createMockPlan({
      id: 'plan1234',
      original_id: 123456,
      exp: FUTURE_EXPIRY,
      metadata: {
        name: 'Test plan',
        access: {
          drm_policy_id: 'drm_policy_123',
          include_tags: [],
          exclude_tags: [],
          include_custom_params: [],
          exclude_custom_params: [],
        },
        access_model: 'svod',
        external_providers: {
          stripe: 'stripe_id',
        },
      },
    }),
  ],
  FREE: [
    createMockPlan({
      id: 'free1234',
      original_id: 123457,
      exp: FUTURE_EXPIRY,
      metadata: {
        name: 'Free plan',
        access: {
          drm_policy_id: 'drm_policy_456',
          include_tags: [],
          exclude_tags: [],
          include_custom_params: [],
          exclude_custom_params: [],
        },
        access_model: 'free',
        external_providers: {},
      },
    }),
  ],
  INVALID: [
    createMockPlan({
      id: 'plan123456',
      original_id: 123458,
      exp: FUTURE_EXPIRY,
      metadata: {
        name: 'Invalid plan',
        access: {
          drm_policy_id: 'drm_policy_789',
          include_tags: [],
          exclude_tags: [],
          include_custom_params: [],
          exclude_custom_params: [],
        },
        access_model: 'svod',
        external_providers: {},
      },
    }),
  ],
  EXPIRED: [
    createMockPlan({
      id: 'plan1234',
      original_id: 123459,
      exp: PAST_EXPIRY,
      metadata: {
        name: 'Expired plan',
        access: {
          drm_policy_id: 'drm_policy_101',
          include_tags: [],
          exclude_tags: [],
          include_custom_params: [],
          exclude_custom_params: [],
        },
        access_model: 'svod',
        external_providers: {},
      },
    }),
  ],
};

// Valid and invalid site id mock
export const SITE_ID = {
  VALID: 'test1234',
  VALID_UPPER: 'A1B2C3D4',
  INVALID: 'invalid1234',
  SHORT: 'abc123',
  LONG: 'abcd12345',
  SPECIAL: 'abcd123!',
  EMPTY: '',
};

// Authorization mock - valid and invalid token
export const AUTHORIZATION = {
  VALID: 'Bearer valid-authorization',
  INVALID: 'Bearer invalid-authorization',
  MISSING: '',
};

// Store price mock
export const STORE_PRICE: Price = {
  store_price_id: 'price_123456789',
  currencies: {
    usd: {
      amount: 1000, // Amount in cents for USD
    },
  },
  default_currency: 'usd',
  recurrence: {
    interval: 'month',
    duration: 1, // Occurs every 1 month
    trial_period_interval: 'month', // Free trial is based on months
    trial_period_duration: 1, // 1 month trial
  },
  billing_scheme: 'per_unit', // Only per_unit supported for now
};

// Store product mock
export const STORE_PRODUCT: Product = {
  store_product_id: 'prod_123456789',
  name: 'Sample Product',
  description: 'A high-quality product description',
  default_store_price_id: 'price_123456789',
  prices: [STORE_PRICE],
};

// Dummy stripe customer id
export const STRIPE_CUSTOMER_ID = 'cus_Qi45IcSi81LstA';

// mock of the handled error cases for Stripe
export const STRIPE_ERRORS = [
  {
    error: new Stripe.errors.StripeInvalidRequestError({
      type: 'invalid_request_error',
      message: 'Invalid request',
    }),
    expectedCode: ErrorDefinitions.BadRequestError.code,
    statusCode: 400,
  },

  {
    error: new Stripe.errors.StripeAuthenticationError({
      type: 'authentication_error',
      message: 'Not authenticated.',
    }),
    expectedCode: ErrorDefinitions.UnauthorizedError.code,
    statusCode: 401,
  },

  {
    error: new Stripe.errors.StripePermissionError({
      type: 'invalid_grant',
      message: 'Permission error request.',
    }),
    expectedCode: ErrorDefinitions.ForbiddenError.code,
    statusCode: 403,
  },

  {
    error: new Stripe.errors.StripeAPIError({
      type: 'api_error',
      message: 'Invalid request',
    }),
    expectedCode: ErrorDefinitions.BadRequestError.code,
    statusCode: 400,
  },
];

// mock of stripe session url
export const STRIPE_SESSION_URL = 'https://example.com';
