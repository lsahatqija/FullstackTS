import type { Server } from 'node:http';

import { createApp } from './app.js';
import { buildAppDependencies } from './composition.js';
import { config } from './config/index.js';
import { closeDatabaseConnection } from './infrastructure/database/client.js';
import { logger } from './infrastructure/logging/logger.js';

/** Loads configuration, connects infrastructure, starts listening and handles shutdown. */
async function start(): Promise<void> {
  const deps = buildAppDependencies();
  const app = createApp(deps);

  const server: Server = app.listen(config.server.port, () => {
    logger.info(
      { port: config.server.port, environment: config.env },
      'API server started',
    );
  });

  let isShuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, 'Shutting down gracefully...');

    server.close(async (closeError) => {
      if (closeError) {
        logger.error({ err: closeError }, 'Error while closing HTTP server');
      }

      try {
        await closeDatabaseConnection();
      } catch (error) {
        logger.error({ err: error }, 'Error while closing database connection');
      } finally {
        logger.info('Shutdown complete.');
        process.exit(closeError ? 1 : 0);
      }
    });

    // Force-exit if connections do not close in time.
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Uncaught exception');
    void shutdown('uncaughtException');
  });
}

start().catch((error) => {
  logger.error({ err: error }, 'Failed to start API server');
  process.exitCode = 1;
});
