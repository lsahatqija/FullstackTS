import type { PublicUser, MeResponse } from '@template/contracts';
import { cookies } from 'next/headers';


import { webConfig } from '../config/env';

/**
 * Server-only helper: authoritatively resolves the current user by forwarding the visitor's
 * cookie to the backend. Used by Server Component layouts/pages to gate protected routes
 * without ever trusting client-side state.
 */
export async function getServerUser(): Promise<PublicUser | null> {
  const cookieHeader = cookies().toString();

  const response = await fetch(`${webConfig.internalApiUrl}/api/v1/auth/me`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: 'no-store',
  });

  if (!response.ok) return null;

  const data = (await response.json()) as MeResponse;
  return data.user;
}
