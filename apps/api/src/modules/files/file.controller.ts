import type { Request, Response } from 'express';

import { ValidationError } from '../../shared/errors/index.js';

import { fileIdParamsSchema } from './file.schemas.js';
import type { FileService } from './file.service.js';

export class FileController {
  constructor(private readonly fileService: FileService) {}

  upload = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new ValidationError('A file is required.', { file: ['No file was uploaded.'] });
    }

    const metadata = await this.fileService.upload({
      ownerId: req.authUser!.id,
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      declaredMimeType: req.file.mimetype,
    });

    res.status(201).json({ file: metadata });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const files = await this.fileService.listForOwner(req.authUser!.id);
    res.status(200).json({ files });
  };

  getMetadata = async (req: Request, res: Response): Promise<void> => {
    const { id } = fileIdParamsSchema.parse(req.params);
    const file = await this.fileService.getMetadata(id, req.authUser!.id);
    res.status(200).json({ file });
  };

  getContent = async (req: Request, res: Response): Promise<void> => {
    const { id } = fileIdParamsSchema.parse(req.params);
    const { stream, record } = await this.fileService.getContentForOwner(id, req.authUser!.id);

    res.setHeader('Content-Type', record.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(record.originalName)}"`);
    res.setHeader('Cache-Control', 'private, max-age=0, no-cache');
    stream.pipe(res);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = fileIdParamsSchema.parse(req.params);
    await this.fileService.delete(id, req.authUser!.id);
    res.status(204).send();
  };
}
