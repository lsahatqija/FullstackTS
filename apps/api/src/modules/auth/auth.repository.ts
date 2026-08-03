import type { CreateSessionData, Session } from './auth.types.js';

/** Business-oriented persistence operations for authentication sessions. */
export interface SessionRepository {
  create(input: CreateSessionData): Promise<Session>;
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  revoke(id: string): Promise<void>;
}
