import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import { createApp } from '../../src/app.create';

/**
 * Interface for E2E test context
 */
export interface E2ETestContext {
  app: INestApplication;
  server: any;
  databaseService: DatabaseService;
}

/**
 * Sets up the E2E test environment
 * - Creates test module
 * - Initializes application
 * - Returns app, server, and databaseService
 *
 * @returns E2E test context
 */
export const setupE2ETest = async (): Promise<E2ETestContext> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  createApp(app);

  await app.init();
  const server = app.getHttpServer();
  const databaseService = moduleFixture.get<DatabaseService>(DatabaseService);

  return { app, server, databaseService };
};

/**
 * Tears down the E2E test environment
 *
 * @param app - NestJS application instance
 */
export const teardownE2ETest = async (app: INestApplication): Promise<void> => {
  if (app) {
    await app.close();
  }
};
