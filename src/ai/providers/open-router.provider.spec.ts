import { Test, TestingModule } from '@nestjs/testing';
import { OpenRouterProvider } from './open-router.provider';
import { AiService } from './ai.service';
import { LoggerService } from '../../logger/logger.service';
import ConfigService from '../../config/config.service';

describe('OpenRouterProviderTsService', () => {
  let service: OpenRouterProvider;

  const mockAiService = {
    generateWorkout: jest.fn(),
  };
  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockOpenRouterProvider = {
    generateWorkout: jest.fn(),
  };

  const mockConfigService = {
    getAiConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AiService, useValue: mockAiService },
        { provide: OpenRouterProvider, useValue: mockOpenRouterProvider },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OpenRouterProvider>(OpenRouterProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
