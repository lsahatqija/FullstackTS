import type { Metadata } from 'next';

import { PageContainer } from '../../../components/ui/index';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <PageContainer>
      <h1>About this template</h1>
      <p>
        A reusable full-stack TypeScript template combining an Express 5 API, a Next.js App Router
        frontend, PostgreSQL persistence, cookie-based authentication and local file storage,
        organized as a modular monolith.
      </p>
    </PageContainer>
  );
}
