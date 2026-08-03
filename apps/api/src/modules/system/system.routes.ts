import { Router } from 'express';

import { asyncHandler } from '../../shared/utilities/async-handler.js';

import type { SystemController } from './system.controller.js';

export function createSystemRouter(systemController: SystemController): Router {
  const router = Router();

  router.get('/live', systemController.liveness);
  router.get('/ready', asyncHandler(systemController.readiness));

  return router;
}
