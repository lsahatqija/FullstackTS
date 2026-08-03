import type { Request, Response } from 'express';

import type { SystemService } from './system.service.js';

export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  liveness = (_req: Request, res: Response): void => {
    res.status(200).json(this.systemService.getLiveness());
  };

  readiness = async (_req: Request, res: Response): Promise<void> => {
    const readiness = await this.systemService.getReadiness();
    res.status(readiness.status === 'ok' ? 200 : 503).json(readiness);
  };
}
