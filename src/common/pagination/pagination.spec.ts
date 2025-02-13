import { Test, TestingModule } from '@nestjs/testing';
import { PaginationProvider } from './pagination.provider';

describe('Pagination', () => {
  let provider: PaginationProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginationProvider],
    }).compile();

    provider = module.get<PaginationProvider>(PaginationProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
