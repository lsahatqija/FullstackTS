import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { z } from 'zod';

// Local dev scripts run with cwd set to apps/api, but the shared .env lives at the repo root.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const boolFromString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_PUBLIC_URL: z.string().url().default('http://localhost:4000'),
  WEB_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
  CORS_ALLOWED_ORIGINS: z.string().min(1).default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters'),
  SESSION_DURATION_HOURS: z.coerce.number().int().min(1).default(24 * 7),
  SESSION_COOKIE_NAME: z.string().min(1).default('template_session'),
  SESSION_COOKIE_SECURE: boolFromString.default('false'),

  JSON_BODY_LIMIT: z.string().min(1).default('1mb'),

  UPLOAD_DIR: z.string().min(1).default('uploads'),
  UPLOAD_MAX_SIZE_BYTES: z.coerce.number().int().min(1).default(5 * 1024 * 1024),
  UPLOAD_ALLOWED_MIME_TYPES: z
    .string()
    .min(1)
    .default('image/jpeg,image/png,image/webp'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().min(1).default(15),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(300),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(10),

  TRUSTED_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Configuration errors must fail startup immediately and loudly, never silently.
    console.error('Invalid environment configuration:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration. See details above.');
  }

  return parsed.data;
}

const env = loadEnv();

export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',

  server: {
    port: env.API_PORT,
    publicUrl: env.API_PUBLIC_URL,
  },

  web: {
    publicUrl: env.WEB_PUBLIC_URL,
  },

  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()),
  },

  jsonBodyLimit: env.JSON_BODY_LIMIT,

  database: {
    url: env.DATABASE_URL,
  },

  session: {
    secret: env.SESSION_SECRET,
    durationHours: env.SESSION_DURATION_HOURS,
    cookieName: env.SESSION_COOKIE_NAME,
    cookieSecure: env.SESSION_COOKIE_SECURE,
  },

  upload: {
    directory: env.UPLOAD_DIR,
    maxSizeBytes: env.UPLOAD_MAX_SIZE_BYTES,
    allowedMimeTypes: env.UPLOAD_ALLOWED_MIME_TYPES.split(',').map((type) => type.trim()),
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  rateLimit: {
    windowMinutes: env.RATE_LIMIT_WINDOW_MINUTES,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    authMaxRequests: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  },

  trustedProxyHops: env.TRUSTED_PROXY_HOPS,
} as const;

export type AppConfig = typeof config;
