'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerRequestSchema, type RegisterRequest } from '@template/contracts';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Alert, Button, FieldError, FormField, Input, Label } from '../../components/ui/index';
import { isApiClientError } from '../../lib/api/errors';

import { authKeys, register as registerRequest } from './auth.api';

export function RegisterForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterRequest>({ resolver: zodResolver(registerRequestSchema) });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
      router.push(redirectTo);
      router.refresh();
    },
    onError: (error) => {
      if (isApiClientError(error)) {
        setError('root', { message: error.message });
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' });
      }
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      noValidate
      aria-label="Create an account"
    >
      {errors.root?.message ? <Alert variant="error">{errors.root.message}</Alert> : null}

      <FormField>
        <Label htmlFor="displayName">Display name</Label>
        <Input id="displayName" type="text" autoComplete="name" {...register('displayName')} />
        <FieldError message={errors.displayName?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        <FieldError message={errors.email?.message} />
      </FormField>

      <FormField>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </FormField>

      <Button type="submit" disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
