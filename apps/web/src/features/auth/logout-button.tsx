'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { Button } from '../../components/ui/index';

import { authKeys, logout } from './auth.api';

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // Clear any cached authenticated data so stale user/file info never lingers client-side.
      queryClient.removeQueries({ queryKey: authKeys.me });
      await queryClient.invalidateQueries();
      router.push('/');
      router.refresh();
    },
  });

  return (
    <Button variant="secondary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
      {mutation.isPending ? 'Logging out...' : 'Log out'}
    </Button>
  );
}
