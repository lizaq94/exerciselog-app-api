import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import { createApp } from '../../src/app.create';
import { StorageProvider } from '../../src/uploads/providers/storage.provider';
import { OpenRouterProvider } from '../../src/ai/providers/open-router.provider';
import { MailService } from '../../src/mail/provider/mail.service';
import {
  ExternalServiceMocks,
  createExternalServiceMocks,
} from './external-services.helper';

/**
 * Interface for E2E test context
 */
export interface E2ETestContext {
  app: INestApplication;
  server: any;
  databaseService: DatabaseService;
  /**
   * The fake implementations injected in place of the real external services
   * (S3 storage, OpenRouter, SMTP). Specs may assert on these `jest.fn()`s.
   */
  mocks: ExternalServiceMocks;
}

/**
 * Sets up the E2E test environment
 * - Creates test module
 * - Overrides external services (S3 storage, OpenRouter, SMTP) with in-memory
 *   fakes so tests never hit real APIs or require real credentials
 * - Initializes application
 * - Returns app, server, databaseService, and the injected mocks
 *
 * @returns E2E test context
 */
export const setupE2ETest = async (): Promise<E2ETestContext> => {
  const mocks = createExternalServiceMocks();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(StorageProvider)
    .useValue(mocks.storageProvider)
    .overrideProvider(OpenRouterProvider)
    .useValue(mocks.openRouterProvider)
    .overrideProvider(MailService)
    .useValue(mocks.mailService)
    .compile();

  const app = moduleFixture.createNestApplication();
  createApp(app);

  await app.init();
  const server = app.getHttpServer();
  const databaseService = moduleFixture.get<DatabaseService>(DatabaseService);

  return { app, server, databaseService, mocks };
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
