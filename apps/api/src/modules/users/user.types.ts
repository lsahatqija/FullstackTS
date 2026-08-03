import type { UserRole } from '@template/contracts';

/** Backend-internal user entity. Includes the password hash; never exposed to transport layer. */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  displayName: string;
  role?: UserRole;
}

export interface UpdateUserData {
  displayName?: string;
}
