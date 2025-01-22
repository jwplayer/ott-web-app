import http from 'http';

import { Express } from 'express';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

import { MockServer } from '../mock-server.js';
import { ErrorDefinitions } from '../../src/errors.js';
import {
  STRIPE_SESSION_URL,
  VALID_PLAN_ID,
  ENDPOINTS,
  STORE_PRODUCT,
  STRIPE_ERRORS,
  AUTHORIZATION,
  SITE_ID,
  STORE_PRICE,
} from '../fixtures.js';
import { MockCheckoutController } from '../mocks/checkout.js';
import { addRoute } from '../../src/pipeline/routes.js';
import { validateSiteId } from '../mocks/middleware.js';

describe('CheckoutController tests', () => {
  let mockServer: MockServer;
  let checkoutController: MockCheckoutController;

  beforeAll(async () => {
    checkoutController = new MockCheckoutController();

    const initializeRoutes = (app: Express) => {
      addRoute(app, 'post', ENDPOINTS.CHECKOUT, checkoutController.initiateCheckout.bind(checkoutController), [
        validateSiteId,
      ]);
      addRoute(
        app,
        'post',
        ENDPOINTS.BILLING_PORTAL,
        checkoutController.generateBillingPortalURL.bind(checkoutController),
        [validateSiteId]
      );
    };

    mockServer = await MockServer.create(initializeRoutes);
  });

  const checkoutTestCases = [
    {
      description: 'should initiate checkout session successfully',
      requestOptions: {
        headers: {
          Authorization: AUTHORIZATION.VALID,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.CHECKOUT.replace(':site_id', SITE_ID.VALID),
        body: JSON.stringify({
          price_id: STORE_PRODUCT.store_product_id,
          success_url: 'http://example.com',
          cancel_url: 'http://example.com',
        }),
      },
      expectedStatusCode: 200,
      expectedResponse: {
        url: STRIPE_SESSION_URL,
      },
    },
    {
      description: 'should return ParameterInvalidError for invalid site_id',
      requestOptions: {
        headers: {
          Authorization: AUTHORIZATION.VALID,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.CHECKOUT.replace(':site_id', SITE_ID.INVALID),
        body: JSON.stringify({
          price_id: STORE_PRICE.store_price_id,
          success_url: 'http://example.com',
          cancel_url: 'http://example.com',
        }),
      },
      expectedStatusCode: 400,
      expectedError: ErrorDefinitions.ParameterInvalidError.code,
    },
    {
      description: 'should return UnauthorizedError for missing authorization token',
      requestOptions: {
        headers: {
          Authorization: AUTHORIZATION.MISSING,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.CHECKOUT.replace(':site_id', SITE_ID.VALID),
      },
      expectedStatusCode: 401,
      expectedError: ErrorDefinitions.UnauthorizedError.code,
    },
    {
      description: 'should handle missing required parameters',
      requestOptions: {
        headers: {
          Authorization: AUTHORIZATION.VALID,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.CHECKOUT.replace(':site_id', SITE_ID.VALID),
        body: JSON.stringify({
          price_id: STORE_PRICE.store_price_id,
          // missing success_url
          // missing cancel_url
        }),
      },
      expectedStatusCode: 400,
      expectedError: ErrorDefinitions.ParameterMissingError.code,
    },
  ];

  const billingPortalTestCases = [
    {
      description: 'should create billing portal URL successfully',
      requestOptions: {
        headers: {
          Authorization: AUTHORIZATION.VALID,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.BILLING_PORTAL.replace(':site_id', SITE_ID.VALID),
        body: JSON.stringify({
          return_url: 'http://example.com',
        }),
      },
      expectedStatusCode: 200,
      expectedResponse: {
        url: STRIPE_SESSION_URL,
      },
    },
    {
      description: 'should return ParameterInvalidError for invalid site_id',
      requestOptions: {
        headers: {
          Authorization: AUTHORIZATION.VALID,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.CHECKOUT.replace(':site_id', SITE_ID.INVALID),
        body: JSON.stringify({
          return_url: 'http://example.com',
        }),
      },
      expectedStatusCode: 400,
      expectedError: ErrorDefinitions.ParameterInvalidError.code,
    },
    {
      description: 'should return UnauthorizedError for missing authorization token in billing portal',
      requestOptions: {
        headers: {
          Authorization: AUTHORIZATION.MISSING,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.BILLING_PORTAL.replace(':site_id', SITE_ID.VALID),
      },
      expectedStatusCode: 401,
      expectedError: ErrorDefinitions.UnauthorizedError.code,
    },
    {
      description: 'should handle missing required parameters in billing portal',
      requestOptions: {
        headers: {
          Authorization: AUTHORIZATION.VALID,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.BILLING_PORTAL.replace(':site_id', SITE_ID.VALID),
        body: JSON.stringify({
          // missing return_url
        }),
      },
      expectedStatusCode: 400,
      expectedError: ErrorDefinitions.ParameterMissingError.code,
    },
  ];

  const allTestCases = [...checkoutTestCases, ...billingPortalTestCases];

  it.each(allTestCases)(
    '$description',
    async ({ requestOptions, expectedStatusCode, expectedResponse, expectedError }) => {
      const response = await new Promise<http.IncomingMessage>((resolve) => {
        mockServer.request(requestOptions, resolve).end();
      });
      expect(response.statusCode).toBe(expectedStatusCode);

      const body = await new Promise<string>((resolve) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve(data);
        });
      });

      const responseBody = JSON.parse(body);

      if (expectedResponse) {
        expect(responseBody).toMatchObject(expectedResponse);
      } else if (expectedError) {
        expect(responseBody.errors[0].code).toBe(expectedError);
      }
    }
  );

  STRIPE_ERRORS.forEach(({ error, expectedCode, statusCode }) => {
    it(`should handle ${error.type} correctly`, async () => {
      checkoutController['paymentService'].setMockBehavior('error', error);

      const requestBody = JSON.stringify({
        access_plan_id: VALID_PLAN_ID,
        price_id: STORE_PRICE.store_price_id,
        mode: 'subscription',
        success_url: 'http://example.com',
        cancel_url: 'http://example.com',
      });

      const requestOptions = {
        headers: {
          Authorization: AUTHORIZATION.VALID,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        path: ENDPOINTS.CHECKOUT.replace(':site_id', SITE_ID.VALID),
        body: requestBody,
      };

      const response = await new Promise<http.IncomingMessage>((resolve) => {
        mockServer.request(requestOptions, resolve).end();
      });

      expect(response.statusCode).toBe(statusCode);

      const body = await new Promise<string>((resolve) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve(data);
        });
      });

      const responseBody = JSON.parse(body);
      expect(responseBody.errors[0].code).toBe(expectedCode);
    });
  });

  afterAll(async () => {
    await mockServer.close();
  });
});
