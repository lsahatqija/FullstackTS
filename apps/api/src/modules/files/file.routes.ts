import { Router, type RequestHandler } from 'express';

import type { FileController } from './file.controller.js';
import { uploadMiddleware } from './file.upload.middleware.js';

export function createFileRouter(fileController: FileController, requireAuth: RequestHandler): Router {
  const router = Router();

  router.use(requireAuth);

  router.post('/', uploadMiddleware, fileController.upload);
  router.get('/', fileController.list);
  router.get('/:id', fileController.getMetadata);
  router.get('/:id/content', fileController.getContent);
  router.delete('/:id', fileController.remove);

  return router;
}
