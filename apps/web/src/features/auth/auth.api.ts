import type { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from '@template/contracts';

import { apiClient } from '../../lib/api/client';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export async function fetchMe(): Promise<MeResponse> {
  const data = await apiClient.get<MeResponse>('auth/me');
  return data ?? { user: null };
}

export async function register(input: RegisterRequest): Promise<AuthResponse> {
  const data = await apiClient.post<AuthResponse>('auth/register', input);
  if (!data) throw new Error('Unexpected empty response from register.');
  return data;
}

export async function login(input: LoginRequest): Promise<AuthResponse> {
  const data = await apiClient.post<AuthResponse>('auth/login', input);
  if (!data) throw new Error('Unexpected empty response from login.');
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post<void>('auth/logout');
}
