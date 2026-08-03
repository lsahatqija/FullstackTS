import { desc, eq } from 'drizzle-orm';

import type { Database } from '../../../infrastructure/database/client.js';
import { files } from '../../../infrastructure/database/schema.js';
import type { FileRepository } from '../file.repository.js';
import type { CreateFileData, FileRecord } from '../file.types.js';

function toDomainFile(record: typeof files.$inferSelect): FileRecord {
  return {
    id: record.id,
    ownerId: record.ownerId,
    storageKey: record.storageKey,
    originalName: record.originalName,
    mimeType: record.mimeType,
    size: record.size,
    createdAt: record.createdAt,
  };
}

export class PostgresFileRepository implements FileRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<FileRecord | null> {
    const [record] = await this.db.select().from(files).where(eq(files.id, id)).limit(1);
    return record ? toDomainFile(record) : null;
  }

  async findByOwner(ownerId: string): Promise<FileRecord[]> {
    const records = await this.db
      .select()
      .from(files)
      .where(eq(files.ownerId, ownerId))
      .orderBy(desc(files.createdAt));

    return records.map(toDomainFile);
  }

  async create(input: CreateFileData): Promise<FileRecord> {
    const [record] = await this.db
      .insert(files)
      .values({
        ownerId: input.ownerId,
        storageKey: input.storageKey,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: input.size,
      })
      .returning();

    if (!record) {
      throw new Error('Failed to persist file metadata.');
    }

    return toDomainFile(record);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(files).where(eq(files.id, id));
  }
}
