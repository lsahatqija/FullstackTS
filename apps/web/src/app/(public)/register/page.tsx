import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PageContainer } from '../../../components/ui/index';
import { RegisterForm } from '../../../features/auth/register-form';
import { getServerUser } from '../../../lib/auth/get-server-user';

export const metadata: Metadata = { title: 'Register' };

export default async function RegisterPage() {
  const user = await getServerUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <PageContainer>
      <h1>Create an account</h1>
      <RegisterForm redirectTo="/dashboard" />
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </PageContainer>
  );
}
