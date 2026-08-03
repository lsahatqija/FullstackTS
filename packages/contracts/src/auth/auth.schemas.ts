import { z } from 'zod';

import { publicUserSchema } from '../users/user.schemas.js';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(200, 'Password is too long');

export const registerRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  displayName: z.string().min(1, 'Display name is required').max(120),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

/** Response returned by register/login/me. The session token itself only ever travels via cookie. */
export const authResponseSchema = z.object({
  user: publicUserSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export const meResponseSchema = z.object({
  user: publicUserSchema.nullable(),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
