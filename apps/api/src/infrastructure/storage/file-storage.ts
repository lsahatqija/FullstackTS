import type { Readable } from 'node:stream';

export interface UploadInput {
  /** Suggested storage key (path-safe, without directory traversal). */
  key: string;
  data: Buffer;
  mimeType: string;
}

export interface StoredFile {
  key: string;
  size: number;
  mimeType: string;
  data: Buffer;
}

/**
 * Storage abstraction for binary file content. The local filesystem adapter implements this
 * for development; a future S3/Azure Blob/GCS adapter can implement the same contract without
 * any change to the file service or controller.
 */
export interface FileStorage {
  save(input: UploadInput): Promise<{ key: string; size: number }>;
  get(key: string): Promise<StoredFile | null>;
  getStream(key: string): Promise<Readable | null>;
  delete(key: string): Promise<void>;
}
