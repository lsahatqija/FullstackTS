'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

import { Button, Card, EmptyState, LoadingIndicator, Alert } from '../../components/ui/index';
import { isApiClientError } from '../../lib/api/errors';
import { webConfig } from '../../lib/config/env';

import { deleteFile, filesKeys, listFiles } from './files.api';

export function FileList() {
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: filesKeys.list, queryFn: listFiles });

  const deleteMutation = useMutation({
    mutationFn: deleteFile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: filesKeys.list });
    },
  });

  if (query.isLoading) return <LoadingIndicator label="Loading files..." />;

  if (query.isError) {
    return (
      <Alert variant="error">
        {isApiClientError(query.error) ? query.error.message : 'Failed to load files.'}
      </Alert>
    );
  }

  const files = query.data?.files ?? [];

  if (files.length === 0) {
    return <EmptyState title="No files yet" description="Upload an image above to see it here." />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
      {files.map((file) => (
        <Card key={file.id}>
          <Image
            src={`${webConfig.publicApiUrl}${file.url}`}
            alt={file.originalName}
            width={200}
            height={150}
            unoptimized
            style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius)' }}
          />
          <p style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{file.originalName}</p>
          <Button
            variant="secondary"
            onClick={() => deleteMutation.mutate(file.id)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Card>
      ))}
    </div>
  );
}
