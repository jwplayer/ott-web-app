import Stripe from 'stripe';
import { Plan } from '@jwp/ott-common/types/plans.js';

import { PlansService } from '../../src/services/plans-service.js';
import { PLANS } from '../fixtures.js';
import { ProductsController } from '../../src/controllers/products-controller.js';
import { PaymentService } from '../../src/services/payment-service.js';

import { MockStripePaymentService } from './payment.js';

export type MockBehavior = 'default' | 'empty' | 'error';

export interface MockPaymentService extends PaymentService {
  setMockBehavior(behavior: 'default' | 'empty' | 'error', error?: Stripe.errors.StripeError): unknown;
}

// Mock PlansService
export class MockPlansService extends PlansService {
  async getAvailablePlans(): Promise<Plan[]> {
    return PLANS.VALID;
  }
}

export class MockProductsController extends ProductsController {
  constructor() {
    super();
    Reflect.set(this, 'paymentService', new MockStripePaymentService());
    Reflect.set(this, 'plansService', new MockPlansService());
  }
}
