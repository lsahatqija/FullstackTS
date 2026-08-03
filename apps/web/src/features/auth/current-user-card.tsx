'use client';

import { Alert, Card, LoadingIndicator } from '../../components/ui/index';
import { isApiClientError } from '../../lib/api/errors';

import { useCurrentUser } from './use-current-user';

/** Demonstrates the dashboard retrieving the current user from the backend via TanStack Query. */
export function CurrentUserCard() {
  const { data, isLoading, isError, error } = useCurrentUser();

  if (isLoading) return <LoadingIndicator label="Loading your account..." />;

  if (isError) {
    return <Alert variant="error">{isApiClientError(error) ? error.message : 'Failed to load your account.'}</Alert>;
  }

  const user = data?.user;
  if (!user) {
    return <Alert variant="error">Your session has expired. Please log in again.</Alert>;
  }

  return (
    <Card>
      <p>
        Welcome back, <strong>{user.displayName}</strong>.
      </p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </Card>
  );
}
