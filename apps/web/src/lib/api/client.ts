import { apiErrorResponseSchema } from '@template/contracts';

import { webConfig } from '../config/env';

import { ApiClientError } from './errors';

const DEFAULT_TIMEOUT_MS = 10_000;

export interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Only needed for server-side calls (Server Components/route handlers) to forward the visitor's cookie. */
  cookieHeader?: string;
}

function resolveBaseUrl(): string {
  return typeof window === 'undefined' ? webConfig.internalApiUrl : webConfig.publicApiUrl;
}

/** Endpoint paths are given relative to the versioned API base, e.g. "auth/me" or "files/123". */
function buildUrl(path: string, query?: RequestOptions['query']): string {
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(`/api/v1/${normalizedPath}`, resolveBaseUrl());
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T | null> {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiClientError(response.status, {
        code: 'INTERNAL_ERROR',
        message: 'The server returned an unexpected response.',
      });
    }
    // Non-JSON success responses (e.g. binary content) are handled by callers directly via fetch.
    return null;
  }

  const json: unknown = await response.json();

  if (!response.ok) {
    const parsedError = apiErrorResponseSchema.safeParse(json);
    if (parsedError.success) {
      throw new ApiClientError(response.status, parsedError.data.error);
    }
    throw new ApiClientError(response.status, {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    });
  }

  return json as T;
}

async function request<T>(
  method: string,
  path: string,
  body: unknown,
  options: RequestOptions = {},
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const headers: Record<string, string> = {};
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.cookieHeader) {
    headers.Cookie = options.cookieHeader;
  }

  try {
    const response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      // Multipart requests must let the browser set the Content-Type boundary itself.
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      credentials: 'include',
      signal: controller.signal,
      cache: 'no-store',
    });

    return await parseResponse<T>(response);
  } finally {
    clearTimeout(timeout);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, undefined, options),
  postForm: <T>(path: string, formData: FormData, options?: RequestOptions) =>
    request<T>('POST', path, formData, options),
};
