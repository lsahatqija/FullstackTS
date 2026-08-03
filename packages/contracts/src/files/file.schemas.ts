import { z } from 'zod';

import { idSchema, isoDateTimeSchema } from '../common/identifiers.js';

export const allowedFileMimeTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp']);

export type AllowedFileMimeType = z.infer<typeof allowedFileMimeTypeSchema>;

/** File metadata as returned by the API. Never includes the on-disk storage key. */
export const fileMetadataSchema = z.object({
  id: idSchema,
  ownerId: idSchema,
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  url: z.string(),
  createdAt: isoDateTimeSchema,
});

export type FileMetadata = z.infer<typeof fileMetadataSchema>;

export const fileListResponseSchema = z.object({
  files: z.array(fileMetadataSchema),
});

export type FileListResponse = z.infer<typeof fileListResponseSchema>;
