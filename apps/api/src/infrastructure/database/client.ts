import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { config } from '../../config/index.js';
import { logger } from '../logging/logger.js';

import * as schema from './schema.js';

export const pool = new Pool({ connectionString: config.database.url });

pool.on('connect', () => {
  logger.debug('Database connection established');
});

pool.on('error', (error) => {
  logger.error({ err: error }, 'Unexpected database pool error');
});

export const db = drizzle(pool, { schema });

export type Database = typeof db;

/** Used by the readiness endpoint to confirm the database is reachable. */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Database readiness check failed');
    return false;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  await pool.end();
  logger.info('Database connection pool closed');
}
