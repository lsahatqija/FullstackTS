import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { logger } from '../logging/logger.js';

import { closeDatabaseConnection, db } from './client.js';

async function run(): Promise<void> {
  logger.info('Running database migrations...');
  await migrate(db, { migrationsFolder: './src/infrastructure/database/migrations' });
  logger.info('Database migrations completed.');
  await closeDatabaseConnection();
}

run().catch((error) => {
  logger.error({ err: error }, 'Database migration failed');
  process.exitCode = 1;
});
