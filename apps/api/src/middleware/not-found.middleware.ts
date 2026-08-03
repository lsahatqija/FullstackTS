import type { Request, Response } from 'express';

/** Handles any request that did not match a declared route. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `No route matches ${req.method} ${req.originalUrl}.`,
      requestId: req.id,
    },
  });
}
