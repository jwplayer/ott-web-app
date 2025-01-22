import { describe, it, expect } from 'vitest';

import { ErrorDefinitions } from '../../src/errors.js';

describe('AccessBridgeError', () => {
  // Test for each error definition
  for (const [key, definition] of Object.entries(ErrorDefinitions)) {
    const errorKey = key as keyof typeof ErrorDefinitions;
    const { code, statusCode, description } = definition;

    it(`should create ${errorKey} with the correct code and status code`, () => {
      const error = definition.create({});
      expect(error.code).toBe(code);
      expect(error.statusCode).toBe(statusCode);

      // Test default description
      const expectedDescription = description.replace('{parameterName}', '').replace('{reason}', '');
      expect(error.description).toBe(expectedDescription);
    });

    it(`should create ${errorKey} with a custom description`, () => {
      // Define context based on error type
      const context = (() => {
        switch (errorKey) {
          case 'ParameterMissingError':
            return { parameterName: 'testParam' };
          case 'ParameterInvalidError':
            return { parameterName: 'testParam', reason: 'Invalid reason' };
          default:
            return {};
        }
      })();

      // Define the custom description
      const customDescription = (() => {
        switch (errorKey) {
          case 'ParameterMissingError':
            return `Required parameter ${context.parameterName} is missing.`;
          case 'ParameterInvalidError':
            return `Parameter ${context.parameterName} is invalid. ${context.reason || ''}`;
          default:
            return description;
        }
      })();

      // Create the error with context and custom description
      const error = definition.create({
        ...context,
        description: customDescription,
      });

      // Check that the description matches
      expect(error.description).toBe(customDescription);
    });
  }
});
