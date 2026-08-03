import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import {
  apiErrorResponseSchema,
  authResponseSchema,
  fileListResponseSchema,
  fileMetadataSchema,
  livenessResponseSchema,
  loginRequestSchema,
  meResponseSchema,
  publicUserSchema,
  readinessResponseSchema,
  registerRequestSchema,
} from '@template/contracts';
import { z } from 'zod';

extendZodWithOpenApi(z);

const registry = new OpenAPIRegistry();

const bearerCookieSecurity = registry.registerComponent('securitySchemes', 'sessionCookie', {
  type: 'apiKey',
  in: 'cookie',
  name: 'template_session',
});

const ErrorResponse = registry.register('ApiErrorResponse', apiErrorResponseSchema);
const PublicUser = registry.register('PublicUser', publicUserSchema);
const AuthResponse = registry.register('AuthResponse', authResponseSchema);
const MeResponse = registry.register('MeResponse', meResponseSchema);
const FileMetadata = registry.register('FileMetadata', fileMetadataSchema);
const FileListResponse = registry.register('FileListResponse', fileListResponseSchema);

registry.registerPath({
  method: 'get',
  path: '/health/live',
  summary: 'Liveness probe',
  tags: ['System'],
  responses: { 200: { description: 'The process is running.', content: { 'application/json': { schema: livenessResponseSchema } } } },
});

registry.registerPath({
  method: 'get',
  path: '/health/ready',
  summary: 'Readiness probe',
  tags: ['System'],
  responses: {
    200: { description: 'Required infrastructure is available.', content: { 'application/json': { schema: readinessResponseSchema } } },
    503: { description: 'Required infrastructure is unavailable.', content: { 'application/json': { schema: readinessResponseSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  summary: 'Register a new account',
  tags: ['Auth'],
  request: { body: { content: { 'application/json': { schema: registerRequestSchema } } } },
  responses: {
    201: { description: 'Account created.', content: { 'application/json': { schema: AuthResponse } } },
    409: { description: 'Email already registered.', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  summary: 'Log in',
  tags: ['Auth'],
  request: { body: { content: { 'application/json': { schema: loginRequestSchema } } } },
  responses: {
    200: { description: 'Authenticated.', content: { 'application/json': { schema: AuthResponse } } },
    401: { description: 'Invalid credentials.', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/logout',
  summary: 'Log out',
  tags: ['Auth'],
  security: [{ [bearerCookieSecurity.name]: [] }],
  responses: { 204: { description: 'Logged out.' } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  summary: 'Get the current session user, if any',
  tags: ['Auth'],
  security: [{ [bearerCookieSecurity.name]: [] }],
  responses: { 200: { description: 'Current user or null.', content: { 'application/json': { schema: MeResponse } } } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/users/me',
  summary: 'Get the authenticated user profile',
  tags: ['Users'],
  security: [{ [bearerCookieSecurity.name]: [] }],
  responses: {
    200: { description: 'Current user profile.', content: { 'application/json': { schema: z.object({ user: PublicUser }) } } },
    401: { description: 'Authentication required.', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/files',
  summary: 'Upload a file',
  tags: ['Files'],
  security: [{ [bearerCookieSecurity.name]: [] }],
  request: { body: { content: { 'multipart/form-data': { schema: z.object({ file: z.string().openapi({ type: 'string', format: 'binary' }) }) } } } },
  responses: {
    201: { description: 'File uploaded.', content: { 'application/json': { schema: z.object({ file: FileMetadata }) } } },
    400: { description: 'Invalid file.', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/files',
  summary: 'List the authenticated user files',
  tags: ['Files'],
  security: [{ [bearerCookieSecurity.name]: [] }],
  responses: { 200: { description: 'Owned files.', content: { 'application/json': { schema: FileListResponse } } } },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/files/{id}/content',
  summary: 'Download file content',
  tags: ['Files'],
  security: [{ [bearerCookieSecurity.name]: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: 'File content.' },
    404: { description: 'File not found.', content: { 'application/json': { schema: ErrorResponse } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/files/{id}',
  summary: 'Delete a file',
  tags: ['Files'],
  security: [{ [bearerCookieSecurity.name]: [] }],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 204: { description: 'File deleted.' } },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Fullstack TS Template API',
      version: '0.1.0',
      description: 'API documentation for the reusable fullstack template.',
    },
    servers: [{ url: '/' }],
  });
}
