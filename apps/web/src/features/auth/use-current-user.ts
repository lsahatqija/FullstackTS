'use client';

import { useQuery } from '@tanstack/react-query';

import { authKeys, fetchMe } from './auth.api';

/** Client-side current-user query, used where interactive components need live auth state. */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
  });
}
