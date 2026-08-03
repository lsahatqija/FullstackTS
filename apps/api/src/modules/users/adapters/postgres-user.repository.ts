import { eq } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/database/client.js';
import { users } from '../../../infrastructure/database/schema.js';
import type { UserRepository } from '../user.repository.js';
import type { CreateUserData, UpdateUserData, User } from '../user.types.js';

function toDomainUser(record: typeof users.$inferSelect): User {
  return {
    id: record.id,
    email: record.email,
    passwordHash: record.passwordHash,
    displayName: record.displayName,
    role: record.role,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<User | null> {
    const [record] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return record ? toDomainUser(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [record] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return record ? toDomainUser(record) : null;
  }

  async create(input: CreateUserData): Promise<User> {
    const [record] = await this.db
      .insert(users)
      .values({
        email: input.email,
        passwordHash: input.passwordHash,
        displayName: input.displayName,
        role: input.role ?? 'user',
      })
      .returning();

    if (!record) {
      throw new Error('Failed to create user.');
    }

    return toDomainUser(record);
  }

  async update(id: string, input: UpdateUserData): Promise<User> {
    const [record] = await this.db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!record) {
      throw new Error('Failed to update user: not found.');
    }

    return toDomainUser(record);
  }
}
