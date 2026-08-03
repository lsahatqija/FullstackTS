'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Alert, Button, PageContainer } from '../components/ui/index';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <Alert variant="error">Something went wrong while loading this page.</Alert>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
        <Button onClick={reset}>Try again</Button>
        <Link href="/">Go home</Link>
      </div>
    </PageContainer>
  );
}
