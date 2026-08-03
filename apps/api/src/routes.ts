import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import type { AppDependencies } from './composition.js';
import { config } from './config/index.js';
import { generateOpenApiDocument } from './infrastructure/openapi/document.js';
import { verifyRequestOrigin } from './middleware/verify-origin.middleware.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createFileRouter } from './modules/files/file.routes.js';
import { createSystemRouter } from './modules/system/system.routes.js';
import { createUserRouter } from './modules/users/user.routes.js';


const API_BASE_PATH = '/api/v1';

export function registerRoutes(app: Express, deps: AppDependencies): void {
  const { controllers, middleware } = deps;

  app.use('/health', createSystemRouter(controllers.systemController));

  app.use(API_BASE_PATH, verifyRequestOrigin);

  app.use(
    `${API_BASE_PATH}/auth`,
    createAuthRouter(controllers.authController, middleware.requireAuth, middleware.optionalAuth),
  );
  app.use(`${API_BASE_PATH}/users`, createUserRouter(controllers.userController, middleware.requireAuth));
  app.use(`${API_BASE_PATH}/files`, createFileRouter(controllers.fileController, middleware.requireAuth));

  const openApiDocument = generateOpenApiDocument();
  app.get(`${API_BASE_PATH}/openapi.json`, (_req, res) => res.json(openApiDocument));

  if (config.isDevelopment) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  }
}
