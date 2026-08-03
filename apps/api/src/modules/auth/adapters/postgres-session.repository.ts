import { eq } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/database/client.js';
import { sessions } from '../../../infrastructure/database/schema.js';
import type { SessionRepository } from '../auth.repository.js';
import type { CreateSessionData, Session } from '../auth.types.js';

function toDomainSession(record: typeof sessions.$inferSelect): Session {
  return {
    id: record.id,
    userId: record.userId,
    tokenHash: record.tokenHash,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
    revokedAt: record.revokedAt,
  };
}

export class PostgresSessionRepository implements SessionRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreateSessionData): Promise<Session> {
    const [record] = await this.db
      .insert(sessions)
      .values({ userId: input.userId, tokenHash: input.tokenHash, expiresAt: input.expiresAt })
      .returning();

    if (!record) {
      throw new Error('Failed to create session.');
    }

    return toDomainSession(record);
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const [record] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.tokenHash, tokenHash))
      .limit(1);

    return record ? toDomainSession(record) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, id));
  }
}
