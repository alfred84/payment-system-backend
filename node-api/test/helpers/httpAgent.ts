import type { Express } from 'express';
import request, { type Agent } from 'supertest';

import { createContainer, type AppContainer } from '../../src/infrastructure/di/container';
import { createApp } from '../../src/interfaces/http/app';
import { toAppDependencies } from '../../src/interfaces/http/containerAdapter';
import { getTestDatabaseUrl } from './integrationDb';

export interface TestHttpContext {
  app: Express;
  container: AppContainer;
  request: Agent;
}

/**
 * Create a Supertest-bound Express app wired to the test database.
 *
 * @returns App, container, and Supertest agent.
 */
export function createTestHttpContext(): TestHttpContext {
  const container = createContainer({ databaseUrl: getTestDatabaseUrl() });
  const app = createApp(toAppDependencies(container));
  return {
    app,
    container,
    request: request(app),
  };
}
