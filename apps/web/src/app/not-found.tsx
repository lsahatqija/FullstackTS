import Link from 'next/link';

import { EmptyState, PageContainer } from '../components/ui/index';

export default function NotFound() {
  return (
    <PageContainer>
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
      />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link href="/" className="button">
          Go home
        </Link>
      </div>
    </PageContainer>
  );
}
