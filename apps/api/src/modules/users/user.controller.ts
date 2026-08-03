import type { Request, Response } from 'express';

import { updateProfileRequestSchema } from './user.schemas.js';
import type { UserService } from './user.service.js';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getMe = async (req: Request, res: Response): Promise<void> => {
    // requireAuth guarantees req.authUser is set before this handler runs.
    res.status(200).json({ user: req.authUser });
  };

  updateMe = async (req: Request, res: Response): Promise<void> => {
    const input = updateProfileRequestSchema.parse(req.body);
    const user = await this.userService.updateDisplayName(req.authUser!.id, input.displayName);
    res.status(200).json({ user });
  };
}
