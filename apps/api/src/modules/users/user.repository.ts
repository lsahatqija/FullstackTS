import type { CreateUserData, UpdateUserData, User } from './user.types.js';

/**
 * Business-oriented persistence operations for users. Implementations must not depend on
 * Express request/response objects, and must be swappable for a non-PostgreSQL provider.
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserData): Promise<User>;
  update(id: string, input: UpdateUserData): Promise<User>;
}
