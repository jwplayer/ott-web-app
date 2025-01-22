import { NextFunction, Request, Response } from 'express';

import { ErrorDefinitions, sendErrors } from '../../src/errors';
import { SITE_ID } from '../fixtures';

/**
 * Mock Middleware to validate 'site_id' parameter
 */
export const validateSiteId = (req: Request, res: Response, next: NextFunction) => {
  if (req.params.site_id !== SITE_ID.VALID) {
    sendErrors(res, ErrorDefinitions.ParameterInvalidError.create({ parameterName: 'site_id' }));
    return;
  }

  // If valid, move to the next middleware or controller
  next();
};
