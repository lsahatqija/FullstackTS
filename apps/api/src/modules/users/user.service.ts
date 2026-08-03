import type { PublicUser } from '@template/contracts';

import { NotFoundError } from '../../shared/errors/index.js';

import type { UserRepository } from './user.repository.js';
import type { User } from './user.types.js';

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getPublicUserById(id: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    return toPublicUser(user);
  }

  async updateDisplayName(id: string, displayName: string): Promise<PublicUser> {
    const updated = await this.userRepository.update(id, { displayName });
    return toPublicUser(updated);
  }
}
