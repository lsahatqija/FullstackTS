import type { FileListResponse, FileMetadata } from '@template/contracts';

import { apiClient } from '../../lib/api/client';

export const filesKeys = {
  list: ['files'] as const,
};

export async function listFiles(): Promise<FileListResponse> {
  const data = await apiClient.get<FileListResponse>('files');
  return data ?? { files: [] };
}

export async function uploadFile(file: File): Promise<{ file: FileMetadata }> {
  const formData = new FormData();
  formData.append('file', file);
  const data = await apiClient.postForm<{ file: FileMetadata }>('files', formData);
  if (!data) throw new Error('Unexpected empty response from uploadFile.');
  return data;
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient.delete<void>(`files/${id}`);
}
