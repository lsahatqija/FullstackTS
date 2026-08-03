import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PageContainer } from '../../../components/ui/index';
import { LoginForm } from '../../../features/auth/login-form';
import { getServerUser } from '../../../lib/auth/get-server-user';
import { sanitizeRedirectTarget } from '../../../lib/auth/safe-redirect';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const user = await getServerUser();
  const redirectTo = sanitizeRedirectTarget(searchParams.next);

  if (user) {
    redirect(redirectTo);
  }

  return (
    <PageContainer>
      <h1>Log in</h1>
      <LoginForm redirectTo={redirectTo} />
      <p>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </PageContainer>
  );
}
