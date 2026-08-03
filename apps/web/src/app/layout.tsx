import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { QueryProvider } from '../providers/query-provider';

import '../styles/globals.css';
import '../components/ui/ui.css';
import '../components/layout/layout.css';

export const metadata: Metadata = {
  title: {
    default: 'Fullstack TS Template',
    template: '%s | Fullstack TS Template',
  },
  description: 'A reusable full-stack TypeScript template with an Express API and Next.js frontend.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
