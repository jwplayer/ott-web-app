import { NextFunction, Request, Response } from 'express';

import { ErrorDefinitions, sendErrors } from '../../src/errors.js';
import { AUTHORIZATION, VIEWER } from '../fixtures.js';
import { IdentityService } from '../../src/services/identity-service.js';

import { MockStripePaymentService } from './payment.js';

// Mock IdentityService
class MockIdentityService extends IdentityService {
  async getAccount({ authorization }: { authorization: string }) {
    if (authorization === AUTHORIZATION.INVALID) {
      throw ErrorDefinitions.UnauthorizedError.create();
    }

    return VIEWER;
  }
}

// Mock Controller
export class MockCheckoutController {
  private identityService: MockIdentityService;
  private paymentService: MockStripePaymentService;

  constructor() {
    this.identityService = new MockIdentityService();
    this.paymentService = new MockStripePaymentService();
  }

  async initiateCheckout(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      sendErrors(res, ErrorDefinitions.UnauthorizedError.create());
      return;
    }

    const checkoutParams = req.body;
    const validationError = this.paymentService.validateCheckoutParams(checkoutParams);
    if (validationError) {
      sendErrors(res, ErrorDefinitions.ParameterMissingError.create({ parameterName: validationError }));
      return;
    }

    const viewer = await this.identityService.getAccount({ authorization });
    const checkoutSessionUrl = await this.paymentService.createCheckoutSessionUrl(viewer, checkoutParams);

    res.end(JSON.stringify({ url: checkoutSessionUrl }));
  }

  async generateBillingPortalURL(req: Request, res: Response, next: NextFunction) {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      sendErrors(res, ErrorDefinitions.UnauthorizedError.create());
      return;
    }

    // Get the email address from the Authorization token
    const viewer = await this.identityService.getAccount({ authorization });
    if (!viewer.id || !viewer.email) {
      sendErrors(res, ErrorDefinitions.UnauthorizedError.create());
      return;
    }

    const { return_url } = req.body;
    if (!return_url) {
      sendErrors(res, ErrorDefinitions.ParameterMissingError.create({ parameterName: 'return_url' }));
      return;
    }

    const billingPortalSessionUrl = await this.paymentService.createBillingPortalSessionUrl(viewer, return_url);
    res.json({ url: billingPortalSessionUrl });
  }
}
