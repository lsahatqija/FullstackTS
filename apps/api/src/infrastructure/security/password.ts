import argon2 from 'argon2';

/** Hashes a plaintext password using Argon2id with sane default cost parameters. */
export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

/** Verifies a plaintext password against a stored Argon2id hash. */
export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  return argon2.verify(hash, plainPassword);
}
