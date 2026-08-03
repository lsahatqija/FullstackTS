import type { PublicUser, UpdateProfileRequest } from '@template/contracts';

import { apiClient } from '../../lib/api/client';

export async function updateProfile(input: UpdateProfileRequest): Promise<{ user: PublicUser }> {
  const data = await apiClient.patch<{ user: PublicUser }>('users/me', input);
  if (!data) throw new Error('Unexpected empty response from updateProfile.');
  return data;
}
