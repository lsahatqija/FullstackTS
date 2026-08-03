import { randomUUID } from 'node:crypto';
import path from 'node:path';

import type { FileMetadata } from '@template/contracts';
import { fileTypeFromBuffer } from 'file-type';

import { config } from '../../config/index.js';
import type { FileStorage } from '../../infrastructure/storage/file-storage.js';
import { NotFoundError, ValidationError } from '../../shared/errors/index.js';

import type { FileRepository } from './file.repository.js';
import type { FileRecord } from './file.types.js';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export interface UploadFileInput {
  ownerId: string;
  buffer: Buffer;
  originalName: string;
  declaredMimeType: string;
}

function toFileMetadata(file: FileRecord): FileMetadata {
  return {
    id: file.id,
    ownerId: file.ownerId,
    originalName: file.originalName,
    mimeType: file.mimeType,
    size: file.size,
    url: `/api/v1/files/${file.id}/content`,
    createdAt: file.createdAt.toISOString(),
  };
}

export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileStorage: FileStorage,
  ) {}

  async upload(input: UploadFileInput): Promise<FileMetadata> {
    if (!config.upload.allowedMimeTypes.includes(input.declaredMimeType)) {
      throw new ValidationError('Unsupported file type.', {
        file: [`Only ${config.upload.allowedMimeTypes.join(', ')} are allowed.`],
      });
    }

    // Inspect the actual file content instead of trusting the client-provided MIME type.
    const detected = await fileTypeFromBuffer(input.buffer);
    if (!detected || !config.upload.allowedMimeTypes.includes(detected.mime)) {
      throw new ValidationError('The file content does not match an allowed image type.', {
        file: ['The file content does not match a supported image type.'],
      });
    }

    const extension = EXTENSION_BY_MIME_TYPE[detected.mime] ?? path.extname(input.originalName);
    const storageKey = `${input.ownerId}/${randomUUID()}${extension}`;

    const { size } = await this.fileStorage.save({
      key: storageKey,
      data: input.buffer,
      mimeType: detected.mime,
    });

    try {
      const record = await this.fileRepository.create({
        ownerId: input.ownerId,
        storageKey,
        originalName: input.originalName,
        mimeType: detected.mime,
        size,
      });
      return toFileMetadata(record);
    } catch (error) {
      // Metadata persistence failed after the binary was already stored: clean up to avoid orphans.
      await this.fileStorage.delete(storageKey);
      throw error;
    }
  }

  async listForOwner(ownerId: string): Promise<FileMetadata[]> {
    const records = await this.fileRepository.findByOwner(ownerId);
    return records.map(toFileMetadata);
  }

  async getMetadata(id: string, requestingUserId: string): Promise<FileMetadata> {
    const record = await this.findOwnedOrThrow(id, requestingUserId);
    return toFileMetadata(record);
  }

  async getContentForOwner(id: string, requestingUserId: string) {
    const record = await this.findOwnedOrThrow(id, requestingUserId);
    const stream = await this.fileStorage.getStream(record.storageKey);
    if (!stream) {
      throw new NotFoundError('File content not found.');
    }
    return { stream, record };
  }

  async delete(id: string, requestingUserId: string): Promise<void> {
    const record = await this.findOwnedOrThrow(id, requestingUserId);
    // Remove metadata first; if storage deletion fails it can be retried without leaking metadata.
    await this.fileRepository.delete(id);
    await this.fileStorage.delete(record.storageKey);
  }

  private async findOwnedOrThrow(id: string, requestingUserId: string): Promise<FileRecord> {
    const record = await this.fileRepository.findById(id);
    // Same NotFoundError for "does not exist" and "not yours": avoids leaking existence of others' files.
    if (!record || record.ownerId !== requestingUserId) {
      throw new NotFoundError('File not found.');
    }
    return record;
  }
}
