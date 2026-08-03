import { z } from 'zod';

export const paginationRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationRequest = z.infer<typeof paginationRequestSchema>;

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export function paginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    pagination: paginationMetaSchema,
  });
}

export type PaginatedResponse<T> = {
  items: T[];
  pagination: PaginationMeta;
};
