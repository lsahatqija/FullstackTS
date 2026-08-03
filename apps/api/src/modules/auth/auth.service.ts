import type { LoginRequest, PublicUser, RegisterRequest } from '@template/contracts';

import { config } from '../../config/index.js';
import { hashPassword, verifyPassword } from '../../infrastructure/security/password.js';
import { generateSessionToken, hashSessionToken } from '../../infrastructure/security/tokens.js';
import { AuthenticationError, ConflictError } from '../../shared/errors/index.js';
import type { UserRepository } from '../users/user.repository.js';
import { toPublicUser } from '../users/user.service.js';

import type { SessionRepository } from './auth.repository.js';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface AuthResult {
  user: PublicUser;
  sessionToken: string;
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async register(input: RegisterRequest): Promise<AuthResult> {
    const email = normalizeEmail(input.email);

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email already exists.');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      displayName: input.displayName,
    });

    const sessionToken = await this.createSession(user.id);
    return { user: toPublicUser(user), sessionToken };
  }

  async login(input: LoginRequest): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const user = await this.userRepository.findByEmail(email);

    // Generic message on purpose: never reveal whether the email exists.
    if (!user) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const sessionToken = await this.createSession(user.id);
    return { user: toPublicUser(user), sessionToken };
  }

  async logout(sessionToken: string): Promise<void> {
    const tokenHash = hashSessionToken(sessionToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);
    if (session) {
      await this.sessionRepository.revoke(session.id);
    }
  }

  async validateSession(sessionToken: string): Promise<PublicUser | null> {
    const tokenHash = hashSessionToken(sessionToken);
    const session = await this.sessionRepository.findByTokenHash(tokenHash);

    if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
      return null;
    }

    const user = await this.userRepository.findById(session.userId);
    return user ? toPublicUser(user) : null;
  }

  private async createSession(userId: string): Promise<string> {
    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + config.session.durationHours * 60 * 60 * 1000);

    await this.sessionRepository.create({ userId, tokenHash, expiresAt });
    return sessionToken;
  }
}
