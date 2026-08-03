import type { Request, Response } from 'express';

import { config } from '../../config/index.js';

import { clearSessionCookie, setSessionCookie } from './auth.cookies.js';
import { loginRequestSchema, registerRequestSchema } from './auth.schemas.js';
import type { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const input = registerRequestSchema.parse(req.body);
    const { user, sessionToken } = await this.authService.register(input);
    setSessionCookie(res, sessionToken);
    res.status(201).json({ user });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = loginRequestSchema.parse(req.body);
    const { user, sessionToken } = await this.authService.login(input);
    setSessionCookie(res, sessionToken);
    res.status(200).json({ user });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.[config.session.cookieName] as string | undefined;
    if (token) {
      await this.authService.logout(token);
    }
    clearSessionCookie(res);
    res.status(204).send();
  };

  me = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ user: req.authUser ?? null });
  };
}
