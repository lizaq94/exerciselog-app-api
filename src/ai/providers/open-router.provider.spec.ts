import { Test, TestingModule } from '@nestjs/testing';
import { OpenRouterProvider } from './open-router.provider';

describe('OpenRouterProviderTsService', () => {
  let service: OpenRouterProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRouterProvider],
    }).compile();

    service = module.get<OpenRouterProvider>(OpenRouterProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
