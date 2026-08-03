import type { ReactNode } from 'react';

import { Header } from '../../components/layout/header';
import { getServerUser } from '../../lib/auth/get-server-user';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();

  return (
    <>
      <Header user={user} />
      <main>{children}</main>
    </>
  );
}
