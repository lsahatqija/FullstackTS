import type { NextFunction, Request, Response } from 'express';

import { config } from '../../config/index.js';
import { AuthenticationError, AuthorizationError } from '../../shared/errors/index.js';

import type { AuthService } from './auth.service.js';

/**
 * Builds authentication middleware bound to a concrete {@link AuthService} instance,
 * following explicit constructor/factory composition instead of a DI framework.
 */
export function createAuthMiddleware(authService: AuthService) {
  async function resolveUser(req: Request) {
    const token = req.cookies?.[config.session.cookieName] as string | undefined;
    if (!token) return null;
    return authService.validateSession(token);
  }

  const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = await resolveUser(req);
    if (!user) {
      next(new AuthenticationError('Authentication required.'));
      return;
    }
    req.authUser = user;
    next();
  };

  const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = await resolveUser(req);
    if (user) {
      req.authUser = user;
    }
    next();
  };

  return { requireAuth, optionalAuth };
}

/** Authorization seam: restricts a route to one or more roles. Must run after requireAuth. */
export function requireRole(...roles: Array<'user' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser || !roles.includes(req.authUser.role)) {
      next(new AuthorizationError('You are not allowed to perform this action.'));
      return;
    }
    next();
  };
}
