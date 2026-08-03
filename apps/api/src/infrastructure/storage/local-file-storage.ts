import { createReadStream } from 'node:fs';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Readable } from 'node:stream';

import type { FileStorage, StoredFile, UploadInput } from './file-storage.js';

/** Local filesystem implementation of {@link FileStorage}, used for development. */
export class LocalFileStorage implements FileStorage {
  constructor(private readonly rootDir: string) {}

  private resolveSafePath(key: string): string {
    const resolvedRoot = path.resolve(this.rootDir);
    const resolvedPath = path.resolve(resolvedRoot, key);

    // Defends against path traversal even though keys are always generated server-side.
    if (!resolvedPath.startsWith(resolvedRoot + path.sep) && resolvedPath !== resolvedRoot) {
      throw new Error('Resolved storage path escapes the storage root.');
    }

    return resolvedPath;
  }

  async save(input: UploadInput): Promise<{ key: string; size: number }> {
    const filePath = this.resolveSafePath(input.key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.data);
    return { key: input.key, size: input.data.byteLength };
  }

  async get(key: string): Promise<StoredFile | null> {
    const filePath = this.resolveSafePath(key);
    try {
      const [data, stats] = await Promise.all([readFile(filePath), stat(filePath)]);
      return { key, size: stats.size, mimeType: 'application/octet-stream', data };
    } catch {
      return null;
    }
  }

  async getStream(key: string): Promise<Readable | null> {
    const filePath = this.resolveSafePath(key);
    try {
      await stat(filePath);
      return createReadStream(filePath);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolveSafePath(key);
    await rm(filePath, { force: true });
  }
}
