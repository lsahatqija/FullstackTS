import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { Header } from '../../components/layout/header';
import { getServerUser } from '../../lib/auth/get-server-user';

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();

  // Authoritative, server-side gate: unauthenticated visitors never see protected content.
  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <Header user={user} />
      <main>{children}</main>
    </>
  );
}
