import http from 'http';

import { Express } from 'express';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

import { MockServer } from '../mock-server.js';
import { ENDPOINTS, SITE_ID, STRIPE_ERRORS, STORE_PRODUCT } from '../fixtures.js';
import { ErrorDefinitions } from '../../src/errors.js';
import { MockBehavior, MockPaymentService, MockProductsController } from '../mocks/products.js';
import { addRoute } from '../../src/pipeline/routes.js';
import { validateSiteId } from '../mocks/middleware.js';

describe('ProductsController tests', () => {
  let mockServer: MockServer;
  let productsController: MockProductsController;

  beforeAll(async () => {
    productsController = new MockProductsController();

    const initializeRoutes = (app: Express) => {
      addRoute(app, 'get', ENDPOINTS.PRODUCTS, productsController.getProducts.bind(productsController), [
        validateSiteId,
      ]);
    };

    mockServer = await MockServer.create(initializeRoutes);
  });

  const testCases = [
    {
      description: 'should list stripe products',
      requestOptions: {
        method: 'GET',
        path: ENDPOINTS.PRODUCTS.replace(':site_id', SITE_ID.VALID),
      },
      mockBehavior: 'default' as MockBehavior,
      expectedStatusCode: 200,
      expectedResponse: [STORE_PRODUCT],
    },
    {
      description: 'should handle empty products',
      requestOptions: {
        method: 'GET',
        path: ENDPOINTS.PRODUCTS.replace(':site_id', SITE_ID.VALID),
      },
      mockBehavior: 'empty' as MockBehavior,
      expectedStatusCode: 200,
      expectedResponse: [],
    },
    {
      description: 'should return ParameterInvalidError for invalid site_id',
      requestOptions: {
        method: 'GET',
        path: ENDPOINTS.PRODUCTS.replace(':site_id', SITE_ID.INVALID),
      },
      expectedStatusCode: 400,
      expectedError: ErrorDefinitions.ParameterInvalidError.code,
    },
    {
      description: 'should return NotFoundError for invalid route',
      requestOptions: {
        method: 'GET',
        path: `${ENDPOINTS.PRODUCTS.replace(':site_id', SITE_ID.INVALID)}/invalid`,
      },
      expectedStatusCode: 404,
      expectedError: ErrorDefinitions.NotFoundError.code,
    },
  ];

  it.each(testCases)(
    '$description',
    async ({ requestOptions, mockBehavior, expectedStatusCode, expectedResponse, expectedError }) => {
      if (mockBehavior) {
        (productsController['paymentService'] as MockPaymentService).setMockBehavior(mockBehavior);
      }

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
      (productsController['paymentService'] as MockPaymentService).setMockBehavior('error', error);

      const requestOptions = {
        method: 'GET',
        path: ENDPOINTS.PRODUCTS.replace(':site_id', SITE_ID.VALID),
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
