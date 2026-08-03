import { Router, type RequestHandler } from 'express';

import { authRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { asyncHandler } from '../../shared/utilities/async-handler.js';

import type { AuthController } from './auth.controller.js';

export function createAuthRouter(
  authController: AuthController,
  requireAuth: RequestHandler,
  optionalAuth: RequestHandler,
): Router {
  const router = Router();

  router.post('/register', authRateLimiter, asyncHandler(authController.register));
  router.post('/login', authRateLimiter, asyncHandler(authController.login));
  router.post('/logout', requireAuth, asyncHandler(authController.logout));
  router.get('/me', optionalAuth, asyncHandler(authController.me));

  return router;
}
