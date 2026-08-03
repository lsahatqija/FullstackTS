import pino from 'pino';

import { config } from '../../config/index.js';

const redactPaths = [
  'req.headers.cookie',
  'req.headers.authorization',
  'res.headers["set-cookie"]',
  '*.password',
  '*.passwordHash',
  '*.token',
  '*.sessionToken',
  '*.secret',
];

export const logger = pino({
  level: config.logging.level,
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]',
  },
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      }
    : undefined,
  base: { service: 'api' },
});

export type Logger = typeof logger;
