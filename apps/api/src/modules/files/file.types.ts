export interface FileRecord {
  id: string;
  ownerId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

export interface CreateFileData {
  ownerId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
}
