import { z } from 'zod';

/**
 * Standard error codes returned by the API. Kept intentionally small and stable
 * since frontend code may switch on these values.
 */
export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'AUTHENTICATION_ERROR',
  'AUTHORIZATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
]);

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const apiErrorDetailsSchema = z.record(z.array(z.string())).optional();

export const apiErrorBodySchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string(),
  details: apiErrorDetailsSchema,
  requestId: z.string().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

/** Full shape returned by the API for every non-2xx JSON response. */
export const apiErrorResponseSchema = z.object({
  error: apiErrorBodySchema,
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
