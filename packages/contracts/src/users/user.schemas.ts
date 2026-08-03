import { z } from 'zod';

import { idSchema, isoDateTimeSchema } from '../common/identifiers.js';

export const userRoleSchema = z.enum(['user', 'admin']);

export type UserRole = z.infer<typeof userRoleSchema>;

/** Public user representation. Never includes the password hash or any secret. */
export const publicUserSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  displayName: z.string().min(1).max(120),
  role: userRoleSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export type PublicUser = z.infer<typeof publicUserSchema>;

export const updateProfileRequestSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(120),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
