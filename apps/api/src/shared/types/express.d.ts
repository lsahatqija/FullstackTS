import type { PublicUser } from '@template/contracts';

/** Augments Express's Request with fields attached by cross-cutting middleware. */
declare global {
  namespace Express {
    interface Request {
      /** Populated by pino-http; re-declared here so it is visible without importing pino-http types. */
      id: string;
      authUser?: PublicUser;
    }
  }
}

export {};
