'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred while loading the application.</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
