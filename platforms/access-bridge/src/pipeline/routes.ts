import { Express, Request, Response, NextFunction } from 'express';

import { AccessController } from '../controllers/access-controller.js';
import { ProductsController } from '../controllers/products-controller.js';
import { CheckoutController } from '../controllers/checkout-controller.js';

import { Middleware } from './middleware.js';

const middleware = new Middleware();
const accessController = new AccessController();
const productsController = new ProductsController();
const checkoutController = new CheckoutController();

/* Disable ESLint max-len and Prettier formatting to keep routes on one line for better readability. */
/* eslint-disable max-len */
// prettier-ignore
export function initializeRoutes(app: Express) {
  // Register routes with their respective controller methods
  addRoute(app, 'put', '/v2/sites/:site_id/access/generate', accessController.generatePassport.bind(accessController));
  addRoute(app, 'put', '/v2/sites/:site_id/access/refresh', accessController.refreshPassport.bind(accessController));
  addRoute(app, 'get', '/v2/sites/:site_id/products', productsController.getProducts.bind(productsController));
  addRoute(app, 'post', '/v2/sites/:site_id/checkout', checkoutController.initiateCheckout.bind(checkoutController));
  addRoute(app, 'post', '/v2/sites/:site_id/billing-portal', checkoutController.generateBillingPortalURL.bind(checkoutController));
}

// Adds a route to the Express application with the specified HTTP method, path, and handler.
export function addRoute(
  app: Express,
  method: 'get' | 'post' | 'put',
  path: string,
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  customMiddleware: Array<(req: Request, res: Response, next: NextFunction) => void> = [middleware.validateSiteId]
) {
  // By default, validateSiteId middleware is added on each registered route with possibility to override.
  // asyncWrapper ensures that any errors in async operations are caught and passed to the global error handler.
  app[method](path, [...customMiddleware, middleware.asyncWrapper(handler)]);
}
