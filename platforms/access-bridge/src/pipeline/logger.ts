import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Logger class for handling various log levels and sending error reports to Sentry if integrated.
 */
class Logger {
  constructor() {
    this.initializeSentry();
  }

  /**
   * Configures the Sentry client for error and performance monitoring.
   * Reads Sentry configuration from environment variables and initializes Sentry if a DSN is provided.
   */
  private initializeSentry() {
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      return; // Skip Sentry initialization for non-production/test environments
    }

    const SENTRY_DSN = process.env.APP_SENTRY_DSN || '';
    const SENTRY_TRACE_RATE = parseFloat(process.env.APP_SENTRY_TRACE_RATE || '1.0');

    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        integrations: this.getSentryIntegrations(),
        environment: process.env.MODE || 'development',
        release: process.env.APP_VERSION,
        tracesSampleRate: SENTRY_TRACE_RATE,
        profilesSampleRate: SENTRY_TRACE_RATE,
      });
    }
  }

  // Include nodeProfilingIntegration only in production mode
  private getSentryIntegrations() {
    if (process.env.NODE_ENV === 'production') {
      return [nodeProfilingIntegration()];
    }

    return [];
  }

  /**
   * Logs an error message and sends it to Sentry if integrated.
   * @param message - The error message to log.
   * @param error - An optional error object to capture.
   */
  error(message: string, error?: unknown) {
    console.error(message, error ?? '');

    if (Sentry.getClient()) {
      if (error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(message, 'error');
      }
    }
  }

  /**
   * Logs an informational message and sends it to Sentry if integrated.
   * @param message - The informational message to log.
   */
  info(message: string) {
    console.info(message);

    if (Sentry.getClient()) {
      Sentry.captureMessage(message, 'info');
    }
  }

  /**
   * Logs a warning message and sends it to Sentry if integrated.
   * @param message - The warning message to log.
   */
  warn(message: string) {
    console.warn(message);

    if (Sentry.getClient()) {
      Sentry.captureMessage(message, 'warning');
    }
  }
}

const logger = new Logger();
export default logger;
