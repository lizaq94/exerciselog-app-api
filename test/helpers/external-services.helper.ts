import { v4 as uuid4 } from 'uuid';
import { RAW_AI_RESPONSES } from '../../src/ai/services/__mocks__/ai-responses.mock';

/**
 * In-memory fakes for the three external services the app talks to
 * (S3-compatible storage, OpenRouter, SMTP). They are injected into the e2e
 * TestingModule via `.overrideProvider(...)` so that e2e tests NEVER perform
 * real network calls and DO NOT require valid AWS/SMTP/OpenRouter credentials.
 *
 * Each fake exposes `jest.fn()` methods so individual specs can assert how the
 * service was (or was not) called.
 */
export interface ExternalServiceMocks {
  storageProvider: { fileUpload: jest.Mock };
  openRouterProvider: { generateWorkout: jest.Mock };
  mailService: { sendUserWelcome: jest.Mock };
}

/**
 * Fake `StorageProvider` — mimics a successful S3 put by returning a
 * deterministic object key, without ever constructing an `S3Client`.
 */
export const createFakeStorageProvider = () => ({
  fileUpload: jest.fn(async (file: Express.Multer.File) => {
    const extension = file?.originalname?.split('.').pop() ?? 'bin';
    return `test-image-${uuid4()}.${extension}`;
  }),
});

/**
 * Fake `OpenRouterProvider` — returns a canned raw AI response (the same
 * fixture used by unit tests), so the real parser + transformer pipeline still
 * runs end-to-end without an HTTP call to OpenRouter.
 */
export const createFakeOpenRouterProvider = () => ({
  generateWorkout: jest.fn(async () => RAW_AI_RESPONSES.singlePlan),
});

/**
 * Fake `MailService` — swallows welcome emails so no SMTP connection is ever
 * opened, regardless of the `NODE_ENV` gate in `AuthService`.
 */
export const createFakeMailService = () => ({
  sendUserWelcome: jest.fn(async () => undefined),
});

/**
 * Builds all external-service fakes at once.
 */
export const createExternalServiceMocks = (): ExternalServiceMocks => ({
  storageProvider: createFakeStorageProvider(),
  openRouterProvider: createFakeOpenRouterProvider(),
  mailService: createFakeMailService(),
});
