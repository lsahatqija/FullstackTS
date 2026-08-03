import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { pinoHttp, type Options } from 'pino-http';

import { logger } from './logger.js';

const genReqId: NonNullable<Options['genReqId']> = (req: IncomingMessage, res: ServerResponse) => {
  const existing = req.headers['x-request-id'];
  const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
  res.setHeader('x-request-id', id);
  return id;
};

/** HTTP request logger. Attaches/propagates a request ID and logs method, path, status and duration. */
export const httpLogger = pinoHttp({
  logger,
  genReqId,
  customLogLevel: (_req: IncomingMessage, res: ServerResponse, err?: Error) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req: { method: string; url: string }) => ({ method: req.method, url: req.url }),
    res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
  },
});
