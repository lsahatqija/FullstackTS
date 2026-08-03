import type { NextFunction, Request, Response } from 'express';

import { config } from '../config/index.js';
import { AuthorizationError } from '../shared/errors/index.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Rejects state-changing, cookie-authenticated requests whose Origin header is not an
 * explicitly allowed origin. This provides CSRF protection on top of SameSite cookies.
 */
export function verifyRequestOrigin(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;
  if (!origin) {
    // Same-origin browser requests, non-browser clients and tools may omit Origin; only
    // enforce when an Origin header is actually present, since we still verify via
    // SameSite cookies and CORS for cross-origin access.
    next();
    return;
  }

  if (!config.cors.allowedOrigins.includes(origin)) {
    next(new AuthorizationError('Request origin is not allowed.'));
    return;
  }

  next();
}
