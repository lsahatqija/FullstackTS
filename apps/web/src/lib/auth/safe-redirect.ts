/**
 * Ensures a post-login/registration redirect target is a safe, relative, in-app path.
 * Never allows redirecting to an arbitrary external URL.
 */
export function sanitizeRedirectTarget(target: string | null | undefined): string {
  const fallback = '/dashboard';
  if (!target) return fallback;
  if (!target.startsWith('/') || target.startsWith('//')) return fallback;
  if (target.includes('://')) return fallback;
  return target;
}
