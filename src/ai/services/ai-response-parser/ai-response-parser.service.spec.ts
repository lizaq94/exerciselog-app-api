import { Test, TestingModule } from '@nestjs/testing';
import { AiResponseParserService } from './ai-response-parser.service';

describe('AiResponseParserService', () => {
  let service: AiResponseParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiResponseParserService],
    }).compile();

    service = module.get<AiResponseParserService>(AiResponseParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
