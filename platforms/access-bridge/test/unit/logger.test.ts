import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/node';

import logger from '../../src/pipeline/logger.js';

describe('Logger Tests', () => {
  // Preserve the original console methods
  const originalConsole = { ...console };

  beforeEach(() => {
    // Reset all mocks to ensure a clean slate for each test
    vi.resetAllMocks();

    // Mock console methods to suppress log outputs during tests
    // Suppressing info output to avoid clutter
    global.console = {
      log: () => {},
      error: () => {},
      warn: () => {},
      info: () => {},
    } as unknown as Console;
  });

  afterEach(() => {
    // Restore the original console methods after each test
    global.console = originalConsole;
  });

  describe('when Sentry is configured', () => {
    const mockCaptureException = vi.fn();
    const mockCaptureMessage = vi.fn();

    beforeEach(() => {
      // Mock Sentry's getClient to return an object with captureException and captureMessage
      // @ts-expect-error we only need certain Sentry methods
      vi.mocked(Sentry.getClient).mockReturnValue({
        captureException: mockCaptureException,
        captureMessage: mockCaptureMessage,
      });

      // Ensure Sentry's captureException and captureMessage methods are also mocked
      vi.mocked(Sentry.captureException).mockImplementation(mockCaptureException);
      vi.mocked(Sentry.captureMessage).mockImplementation(mockCaptureMessage);
    });

    it('should call Sentry.captureException on error', () => {
      const error = new Error('Test error');
      const message = 'Test error message';

      // Call logger.error which should trigger Sentry.captureException
      logger.error(message, error);

      // Verify that captureException was called with the correct arguments
      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });

    it('should call Sentry.captureMessage on info', () => {
      const message = 'Test info message';

      // Call logger.info which should trigger Sentry.captureMessage with 'info'
      logger.info(message);

      // Verify that captureMessage was called with the correct arguments
      expect(mockCaptureMessage).toHaveBeenCalledWith(message, 'info');
    });

    it('should call Sentry.captureMessage on warn', () => {
      const message = 'Test warn message';

      // Call logger.warn which should trigger Sentry.captureMessage with 'warning'
      logger.warn(message);

      // Verify that captureMessage was called with the correct arguments
      expect(mockCaptureMessage).toHaveBeenCalledWith(message, 'warning');
    });
  });

  describe('when Sentry is not configured', () => {
    beforeEach(() => {
      // Mock Sentry's getClient to return undefined
      vi.mocked(Sentry.getClient).mockReturnValue(undefined);

      // Ensure Sentry's captureException and captureMessage methods are mocked
      vi.mocked(Sentry.captureException).mockImplementation(vi.fn());
      vi.mocked(Sentry.captureMessage).mockImplementation(vi.fn());
    });

    it('should not call Sentry.captureException', () => {
      const error = new Error('Test error');
      const message = 'Test error message';

      logger.error(message, error);

      // Verify that captureException was not called
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should not call Sentry.captureMessage for info', () => {
      const message = 'Test info message';

      logger.info(message);

      // Verify that captureMessage was not called
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it('should not call Sentry.captureMessage for warn', () => {
      const message = 'Test warn message';

      logger.warn(message);

      // Verify that captureMessage was not called
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });
  });
});
