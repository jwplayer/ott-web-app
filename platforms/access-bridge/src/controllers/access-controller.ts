import { Request, Response, NextFunction } from 'express';

import { ErrorDefinitions, sendErrors } from '../errors.js';
import { PassportService } from '../services/passport-service.js';
import { PlansService } from '../services/plans-service.js';
import { IdentityService, Viewer } from '../services/identity-service.js';

/**
 * Controller class responsible for handling access-related services.
 * The controller interacts with services for identity management, plans management, and passport generation.
 */
export class AccessController {
  private readonly identityService: IdentityService;
  private readonly passportService: PassportService;
  private readonly plansService: PlansService;

  constructor() {
    this.identityService = new IdentityService();
    this.passportService = new PassportService();
    this.plansService = new PlansService();
  }

  /**
   * Service handler for generating passport access tokens based on the provided authorization token.
   * Retrieves access control plans and generates access tokens.
   */
  async generatePassport(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Anonymous is default for not authenticated viewers.
    // These viewers only have access to free plans.
    let viewer: Viewer = { id: 'anonymous', email: '' };

    const authorization = req.headers['authorization'];
    if (authorization) {
      viewer = await this.identityService.getAccount({ authorization });
      if (!viewer.id || !viewer.email) {
        sendErrors(res, ErrorDefinitions.UnauthorizedError.create());
        return;
      }
    }

    const viewerEntitledPlans = await this.plansService.getEntitledPlans({ authorization });
    const plans = viewerEntitledPlans
      .map((plan) => ({
        id: plan.id,
        exp: plan?.exp,
      }))
      .filter((plan) => plan.id !== undefined && plan.exp !== undefined);

    const passport = await this.passportService.generatePassport({ viewerId: viewer.id, plans });

    res.json(passport);
  }

  /**
   * Service handler for refreshing access tokens based on the provided refresh token.
   */
  async refreshPassport(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { refresh_token: refreshToken } = req.body;
    const passport = await this.passportService.refreshPassport({ refreshToken });

    res.json(passport);
  }
}
