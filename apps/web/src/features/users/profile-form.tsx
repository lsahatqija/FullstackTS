'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfileRequestSchema, type PublicUser, type UpdateProfileRequest } from '@template/contracts';
import { useForm } from 'react-hook-form';

import { Alert, Button, FieldError, FormField, Input, Label } from '../../components/ui/index';
import { isApiClientError } from '../../lib/api/errors';
import { authKeys } from '../auth/auth.api';

import { updateProfile } from './users.api';

export function ProfileForm({ user }: { user: PublicUser }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    defaultValues: { displayName: user.displayName },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
    onError: (error) => {
      setError('root', {
        message: isApiClientError(error) ? error.message : 'Something went wrong. Please try again.',
      });
    },
  });

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate aria-label="Update profile">
      {errors.root?.message ? <Alert variant="error">{errors.root.message}</Alert> : null}
      {mutation.isSuccess ? <Alert>Profile updated.</Alert> : null}

      <FormField>
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" type="text" autoComplete="name" {...register('displayName')} />
        <FieldError message={errors.displayName?.message} />
      </FormField>

      <Button type="submit" disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  );
}
