import type { Metadata } from 'next';

import { PageContainer } from '../../../components/ui/index';
import { ProfileForm } from '../../../features/users/profile-form';
import { getServerUser } from '../../../lib/auth/get-server-user';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  // The parent authenticated layout already guarantees a user is present.
  const user = await getServerUser();

  return (
    <PageContainer>
      <h1>Profile</h1>
      {user ? <ProfileForm user={user} /> : null}
    </PageContainer>
  );
}
