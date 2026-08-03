import type { Metadata } from 'next';

import { PageContainer } from '../../../components/ui/index';
import { CurrentUserCard } from '../../../features/auth/current-user-card';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <PageContainer>
      <h1>Dashboard</h1>
      <p>This protected page retrieves your current user from the backend.</p>
      <CurrentUserCard />
    </PageContainer>
  );
}
