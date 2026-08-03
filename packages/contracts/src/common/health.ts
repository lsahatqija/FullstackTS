import { z } from 'zod';

export const healthStatusSchema = z.enum(['ok', 'degraded', 'error']);

export const livenessResponseSchema = z.object({
  status: healthStatusSchema,
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  uptimeSeconds: z.number(),
});

export type LivenessResponse = z.infer<typeof livenessResponseSchema>;

export const readinessResponseSchema = z.object({
  status: healthStatusSchema,
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  uptimeSeconds: z.number(),
  dependencies: z.object({
    database: healthStatusSchema,
  }),
});

export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
