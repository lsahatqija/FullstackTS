import path from 'node:path';

import multer from 'multer';

import { config } from '../../config/index.js';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/**
 * Multipart parsing is only wired up on the upload endpoint, never globally. Uses memory
 * storage so the file service can inspect the actual bytes before deciding where to store it.
 */
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxSizeBytes, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
      return;
    }
    callback(null, true);
  },
}).single('file');
