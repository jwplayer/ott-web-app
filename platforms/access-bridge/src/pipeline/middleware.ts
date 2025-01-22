import * as Sentry from '@sentry/node';
import Stripe from 'stripe';
import express, { Request, Response, NextFunction, Express } from 'express';
import cors from 'cors';

import {
  AccessBridgeError,
  ErrorDefinitions,
  handleJWError,
  handleStripeError,
  isJWError,
  sendErrors,
} from '../errors.js';
import { SITE_ID } from '../app-config.js';

import logger from './logger.js';

/**
 * Middleware class encapsulates global and route-specific middleware.
 */
export class Middleware {
  /**
   * This ensures that any errors in async operations are caught and passed to the global error handler
   */
  asyncWrapper(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Middleware to validate 'site_id' parameter.
   * This should be applied to routes that require site_id validation.
   */
  validateSiteId = (req: Request, res: Response, next: NextFunction) => {
    if (req.params.site_id !== SITE_ID) {
      sendErrors(res, ErrorDefinitions.ParameterInvalidError.create({ parameterName: 'site_id' }));
      return;
    }
    next();
  };

  /**
   * Global error handler middleware for the server.
   * This handles AccessBridge-specific errors and other unexpected errors.
   */
  globalErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    // Handles SyntaxError in request body by responding with a ParameterInvalidError.
    if (err instanceof SyntaxError && 'body' in err) {
      sendErrors(res, ErrorDefinitions.ParameterInvalidError.create({ parameterName: 'body' }));
      return;
    }

    if (err instanceof AccessBridgeError) {
      sendErrors(res, err);
      return;
    }

    if (err instanceof Stripe.errors.StripeError) {
      const accessBridgeError = handleStripeError(err);
      sendErrors(res, accessBridgeError);
      return;
    }

    if (isJWError(err)) {
      const accessBridgeError = handleJWError(err);
      sendErrors(res, accessBridgeError);
      return;
    }

    logger.error('Unexpected error:', err);
    sendErrors(res, ErrorDefinitions.InternalError.create());
  };

  /**
   * Middleware to handle 404 Not Found errors.
   * This should be registered after all routes to handle undefined endpoints.
   */
  notFoundErrorHandler = (req: Request, res: Response, next: NextFunction) => {
    sendErrors(res, ErrorDefinitions.NotFoundError.create());
  };

  /**
   * Registers global middlewares.
   * @param app The Express application.
   */
  initializeCoreMiddleware(app: Express) {
    // Middleware to enable Cross-Origin Resource Sharing (CORS)
    app.use(cors());
    // Middleware for parsing JSON request bodies
    app.use(express.json());
  }

  /**
   * Registers global error handling middleware.
   * This should be called after all routes are defined to catch errors and handle 404 responses.
   * @param app The Express application.
   */
  initializeErrorMiddleware(app: Express) {
    app.use(this.notFoundErrorHandler); // Handle 404 errors
    app.use(this.globalErrorHandler); // Handle all other errors
  }

  /**
   * Registers Sentry error handler for Expresss.
   * The error handler must be registered before any other error middleware and after all controllers
   * @param app The Express application.
   */
  initializeSentryMiddleware(app: Express) {
    if (Sentry.getClient()) {
      Sentry.setupExpressErrorHandler(app);
    }
  }
}
