import { z } from 'zod';

/** A UUID-based identifier used across all transport contracts. */
export const idSchema = z.string().uuid();

export type Id = z.infer<typeof idSchema>;

/** ISO-8601 date-time string, always serialized as a string over the wire. */
export const isoDateTimeSchema = z.string().datetime({ offset: true });

export type IsoDateTime = z.infer<typeof isoDateTimeSchema>;
