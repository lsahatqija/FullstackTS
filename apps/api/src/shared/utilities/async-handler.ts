import type { NextFunction, Request, Response } from 'express';

/** Wraps an async route/middleware handler so rejected promises reach the error handler. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
}
