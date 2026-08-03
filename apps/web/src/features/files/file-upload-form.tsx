'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { Alert, Button } from '../../components/ui/index';
import { isApiClientError } from '../../lib/api/errors';

import { filesKeys, uploadFile } from './files.api';

export function FileUploadForm() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: async () => {
      setError(null);
      if (inputRef.current) inputRef.current.value = '';
      await queryClient.invalidateQueries({ queryKey: filesKeys.list });
    },
    onError: (uploadError) => {
      setError(isApiClientError(uploadError) ? uploadError.message : 'Upload failed. Please try again.');
    },
  });

  return (
    <form
      aria-label="Upload an image"
      onSubmit={(event) => {
        event.preventDefault();
        const file = inputRef.current?.files?.[0];
        if (file) mutation.mutate(file);
      }}
    >
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="file-upload" className="label">
          Choose an image (JPEG, PNG or WebP)
        </label>
        <input
          id="file-upload"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={mutation.isPending}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </form>
  );
}
