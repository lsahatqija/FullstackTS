import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import type { AppDependencies } from './composition.js';
import { config } from './config/index.js';
import { httpLogger } from './infrastructure/logging/http-logger.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { generalRateLimiter } from './middleware/rate-limit.middleware.js';
import { registerRoutes } from './routes.js';

/** Constructs and configures the Express application. Does not start listening or touch infra. */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.set('trust proxy', config.trustedProxyHops);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(httpLogger);
  app.use(express.json({ limit: config.jsonBodyLimit }));
  app.use(cookieParser());
  app.use(generalRateLimiter);

  registerRoutes(app, deps);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
