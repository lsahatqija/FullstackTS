import type { CreateFileData, FileRecord } from './file.types.js';

/** Business-oriented persistence operations for uploaded file metadata. */
export interface FileRepository {
  findById(id: string): Promise<FileRecord | null>;
  findByOwner(ownerId: string): Promise<FileRecord[]>;
  create(input: CreateFileData): Promise<FileRecord>;
  delete(id: string): Promise<void>;
}
