import { z } from 'zod';

import { logger } from '../logging/logger.js';
import { hashPassword } from '../security/password.js';

import { closeDatabaseConnection, db } from './client.js';
import { users } from './schema.js';

/**
 * Seed data is strictly for local development. It is never created in production and
 * every credential is configurable through environment variables rather than hard-coded.
 */
const seedEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@example.local'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('DevAdminPass123!'),
  SEED_USER_EMAIL: z.string().email().default('user@example.local'),
  SEED_USER_PASSWORD: z.string().min(8).default('DevUserPass123!'),
});

async function run(): Promise<void> {
  const env = seedEnvSchema.parse(process.env);

  if (env.NODE_ENV === 'production') {
    logger.error('Refusing to run development seed data in production.');
    process.exitCode = 1;
    return;
  }

  const seedUsers = [
    {
      email: env.SEED_ADMIN_EMAIL.toLowerCase(),
      password: env.SEED_ADMIN_PASSWORD,
      displayName: 'Development Admin',
      role: 'admin' as const,
    },
    {
      email: env.SEED_USER_EMAIL.toLowerCase(),
      password: env.SEED_USER_PASSWORD,
      displayName: 'Development User',
      role: 'user' as const,
    },
  ];

  for (const seedUser of seedUsers) {
    const passwordHash = await hashPassword(seedUser.password);
    await db
      .insert(users)
      .values({
        email: seedUser.email,
        passwordHash,
        displayName: seedUser.displayName,
        role: seedUser.role,
      })
      .onConflictDoNothing({ target: users.email });

    logger.info(`Seeded development user: ${seedUser.email} (development credentials only)`);
  }

  await closeDatabaseConnection();
}

run().catch((error) => {
  logger.error({ err: error }, 'Database seeding failed');
  process.exitCode = 1;
});
