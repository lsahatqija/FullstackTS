import rateLimit from 'express-rate-limit';

import { config } from '../config/index.js';

/** General-purpose API rate limiter applied to the whole `/api` surface. */
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMinutes * 60 * 1000,
  limit: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
});

/** Stricter limiter for authentication endpoints, to slow down credential guessing. */
export const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMinutes * 60 * 1000,
  limit: config.rateLimit.authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Please try again later.' },
  },
});
