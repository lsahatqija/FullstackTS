import type { Response } from 'express';

import { config } from '../../config/index.js';

const COOKIE_PATH = '/';

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(config.session.cookieName, token, {
    httpOnly: true,
    secure: config.session.cookieSecure,
    sameSite: 'lax',
    path: COOKIE_PATH,
    maxAge: config.session.durationHours * 60 * 60 * 1000,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(config.session.cookieName, {
    httpOnly: true,
    secure: config.session.cookieSecure,
    sameSite: 'lax',
    path: COOKIE_PATH,
  });
}
