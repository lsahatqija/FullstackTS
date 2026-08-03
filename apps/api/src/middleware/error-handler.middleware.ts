import type { ApiErrorCode } from '@template/contracts';
import type { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';

import { logger } from '../infrastructure/logging/logger.js';
import { AppError } from '../shared/errors/index.js';

function zodErrorToDetails(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root';
    details[key] = [...(details[key] ?? []), issue.message];
  }
  return details;
}

/**
 * Final, central error handler. Maps typed application errors, known third-party error
 * shapes and unexpected errors to the standard `{ error }` response shape. Never leaks
 * stack traces or internal details to the client.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.id;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId }, 'Request failed with an internal error');
    } else {
      logger.warn({ err: err.message, requestId, code: err.code }, 'Request failed');
    }

    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details, requestId },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR' satisfies ApiErrorCode,
        message: 'The submitted data is invalid.',
        details: zodErrorToDetails(err),
        requestId,
      },
    });
    return;
  }

  if (err instanceof MulterError) {
    const code: ApiErrorCode = 'VALIDATION_ERROR';
    res.status(400).json({
      error: { code, message: mapMulterMessage(err), requestId },
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR' satisfies ApiErrorCode,
        message: 'The request body is not valid JSON.',
        requestId,
      },
    });
    return;
  }

  if (isPayloadTooLargeError(err)) {
    res.status(413).json({
      error: {
        code: 'VALIDATION_ERROR' satisfies ApiErrorCode,
        message: 'The request payload is too large.',
        requestId,
      },
    });
    return;
  }

  logger.error({ err, requestId }, 'Unhandled error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR' satisfies ApiErrorCode,
      message: 'An unexpected error occurred.',
      requestId,
    },
  });
};

function mapMulterMessage(err: MulterError): string {
  if (err.code === 'LIMIT_FILE_SIZE') return 'The uploaded file exceeds the maximum allowed size.';
  if (err.code === 'LIMIT_UNEXPECTED_FILE') return 'Unexpected file field in the upload.';
  return 'The uploaded multipart data could not be processed.';
}

function isPayloadTooLargeError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type?: string }).type === 'entity.too.large'
  );
}
