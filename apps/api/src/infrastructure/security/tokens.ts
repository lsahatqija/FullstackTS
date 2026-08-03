import { randomBytes, createHash } from 'node:crypto';

/** Generates a cryptographically random, URL-safe opaque session token. */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Hashes a session token for storage. Only the hash is ever persisted. */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
