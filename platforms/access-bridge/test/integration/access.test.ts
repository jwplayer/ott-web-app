import http from 'http';

import { Express } from 'express';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';

import { AccessController } from '../../src/controllers/access-controller.js';
import { MockServer } from '../mock-server.js';
import { ACCESS_TOKENS, AUTHORIZATION, ENDPOINTS, SITE_ID } from '../fixtures.js';
import { MockAccessController } from '../mocks/access.js';
import { ErrorDefinitions } from '../../src/errors.js';
import { addRoute } from '../../src/pipeline/routes.js';
import { validateSiteId } from '../mocks/middleware.js';

describe('AccessController tests', () => {
  let mockServer: MockServer;
  let accessController: AccessController;

  beforeAll(async () => {
    accessController = new MockAccessController();

    const initializeRoutes = (app: Express) => {
      addRoute(app, 'put', ENDPOINTS.GENERATE_PASSPORT, accessController.generatePassport.bind(accessController), [
        validateSiteId,
      ]);
      addRoute(app, 'put', ENDPOINTS.REFRESH_PASSPORT, accessController.refreshPassport.bind(accessController), [
        validateSiteId,
      ]);
    };

    mockServer = await MockServer.create(initializeRoutes);
  });

  const generatePassportTestCases = [
    {
      description: 'should generate passport access tokens without authorization',
      requestOptions: {
        method: 'PUT',
        path: ENDPOINTS.GENERATE_PASSPORT.replace(':site_id', SITE_ID.VALID),
      },
      expectedStatusCode: 200,
      expectedResponse: {
        passport: ACCESS_TOKENS.PASSPORT.VALID,
        refresh_token: ACCESS_TOKENS.REFRESH_TOKEN.VALID,
      },
    },
    {
      description: 'should generate passport access tokens with valid authorization',
      requestOptions: {
        headers: { Authorization: AUTHORIZATION.VALID },
        method: 'PUT',
        path: ENDPOINTS.GENERATE_PASSPORT.replace(':site_id', SITE_ID.VALID),
      },
      expectedStatusCode: 200,
      expectedResponse: {
        passport: ACCESS_TOKENS.PASSPORT.VALID,
        refresh_token: ACCESS_TOKENS.REFRESH_TOKEN.VALID,
      },
    },
    {
      description: 'should return UnauthorizedError for invalid authorization',
      requestOptions: {
        headers: { Authorization: AUTHORIZATION.INVALID },
        method: 'PUT',
        path: ENDPOINTS.GENERATE_PASSPORT.replace(':site_id', SITE_ID.VALID),
      },
      expectedStatusCode: 401,
      expectedError: ErrorDefinitions.UnauthorizedError.code,
    },
    {
      description: 'should return ParameterInvalidError for invalid site_id',
      requestOptions: {
        headers: { Authorization: AUTHORIZATION.VALID },
        method: 'PUT',
        path: ENDPOINTS.GENERATE_PASSPORT.replace(':site_id', SITE_ID.INVALID),
      },
      expectedStatusCode: 400,
      expectedError: ErrorDefinitions.ParameterInvalidError.code,
    },
  ];

  const refreshPassportTestCases = [
    {
      description: 'should refresh passport access tokens with valid refresh_token',
      requestOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        path: ENDPOINTS.REFRESH_PASSPORT.replace(':site_id', SITE_ID.VALID),
        body: JSON.stringify({
          refresh_token: ACCESS_TOKENS.REFRESH_TOKEN.VALID,
        }),
      },
      expectedStatusCode: 200,
      expectedResponse: {
        passport: ACCESS_TOKENS.PASSPORT.VALID,
        refresh_token: ACCESS_TOKENS.REFRESH_TOKEN.VALID,
      },
    },
    {
      description: 'should not generate access tokens with invalid site_id',
      requestOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        path: ENDPOINTS.REFRESH_PASSPORT.replace(':site_id', SITE_ID.INVALID),
        body: JSON.stringify({
          refresh_token: ACCESS_TOKENS.REFRESH_TOKEN.VALID,
        }),
      },
      expectedStatusCode: 400,
      expectedError: ErrorDefinitions.ParameterInvalidError.code,
    },
    {
      description: 'should fail with forbidden for invalid refresh_token provided',
      requestOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        path: ENDPOINTS.REFRESH_PASSPORT.replace(':site_id', SITE_ID.VALID),
        body: JSON.stringify({
          refresh_token: ACCESS_TOKENS.REFRESH_TOKEN.INVALID,
        }),
      },
      expectedStatusCode: 403,
      expectedError: ErrorDefinitions.ForbiddenError.code,
    },
    {
      description: 'should return ParameterMissingError for missing refresh_token',
      requestOptions: {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        path: ENDPOINTS.REFRESH_PASSPORT.replace(':site_id', SITE_ID.VALID),
        body: JSON.stringify({
          // missing refresh_token
        }),
      },
      expectedStatusCode: 400,
      expectedError: ErrorDefinitions.ParameterMissingError.code,
    },
  ];

  const allTestCases = [...generatePassportTestCases, ...refreshPassportTestCases];

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

  afterAll(async () => {
    await mockServer.close();
  });
});
