export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface CreateSessionData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}
