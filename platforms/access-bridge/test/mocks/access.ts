import { Plan } from '@jwp/ott-common/types/plans.js';

import { PassportService } from '../../src/services/passport-service.js';
import { PlansService } from '../../src/services/plans-service.js';
import { ACCESS_TOKENS, PLANS, AUTHORIZATION, VIEWER } from '../fixtures.js';
import { IdentityService } from '../../src/services/identity-service.js';
import { AccessController } from '../../src/controllers/access-controller.js';
import { ErrorDefinitions } from '../../src/errors.js';

// Mock IdentityService
class MockIdentityService extends IdentityService {
  async getAccount({ authorization }: { authorization: string }) {
    if (authorization === AUTHORIZATION.INVALID) {
      throw ErrorDefinitions.UnauthorizedError.create();
    }

    return VIEWER;
  }
}

// Mock PassportService
class MockPassportService extends PassportService {
  async generatePassport() {
    return { passport: ACCESS_TOKENS.PASSPORT.VALID, refresh_token: ACCESS_TOKENS.REFRESH_TOKEN.VALID };
  }

  async refreshPassport({ refreshToken }: { refreshToken: string }) {
    if (!refreshToken) {
      throw ErrorDefinitions.ParameterMissingError.create({});
    }
    if (refreshToken === ACCESS_TOKENS.REFRESH_TOKEN.INVALID) {
      throw ErrorDefinitions.ForbiddenError.create({ description: 'Invalid refresh_token provided' });
    }
    return { passport: ACCESS_TOKENS.PASSPORT.VALID, refresh_token: ACCESS_TOKENS.REFRESH_TOKEN.VALID };
  }
}

// Mock PlansService
class MockPlansService extends PlansService {
  async getAvailablePlans(): Promise<Plan[]> {
    return PLANS.VALID;
  }

  async getEntitledPlans({ authorization }: { authorization: string }): Promise<Plan[]> {
    if (!authorization) {
      // if no auth, only free plans available
      return PLANS.FREE;
    }

    return PLANS.VALID;
  }
}

export class MockAccessController extends AccessController {
  constructor() {
    super();
    Reflect.set(this, 'identityService', new MockIdentityService());
    Reflect.set(this, 'passportService', new MockPassportService());
    Reflect.set(this, 'plansService', new MockPlansService());
  }
}
