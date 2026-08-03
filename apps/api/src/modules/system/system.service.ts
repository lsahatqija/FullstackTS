import type { LivenessResponse, ReadinessResponse } from '@template/contracts';

import { config } from '../../config/index.js';
import { checkDatabaseConnection } from '../../infrastructure/database/client.js';

const SERVICE_NAME = 'template-api';
const APP_VERSION = '0.1.0';
const startedAt = Date.now();

function uptimeSeconds(): number {
  return Math.round((Date.now() - startedAt) / 1000);
}

export class SystemService {
  getLiveness(): LivenessResponse {
    return {
      status: 'ok',
      service: SERVICE_NAME,
      version: APP_VERSION,
      environment: config.env,
      uptimeSeconds: uptimeSeconds(),
    };
  }

  async getReadiness(): Promise<ReadinessResponse> {
    const databaseIsUp = await checkDatabaseConnection();

    return {
      status: databaseIsUp ? 'ok' : 'error',
      service: SERVICE_NAME,
      version: APP_VERSION,
      environment: config.env,
      uptimeSeconds: uptimeSeconds(),
      dependencies: { database: databaseIsUp ? 'ok' : 'error' },
    };
  }
}
