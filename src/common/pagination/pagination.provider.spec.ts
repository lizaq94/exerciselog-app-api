import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { PaginationProvider } from './pagination.provider';

describe('PaginationProvider', () => {
  let provider: PaginationProvider;
  let mockRequest: jest.Mocked<Request>;

  beforeEach(async () => {
    mockRequest = {
      protocol: 'https',
      get: jest.fn().mockReturnValue('example.com'),
      path: '/api/users',
      query: {
        search: 'test',
        sort: 'name',
      },
    } as any as jest.Mocked<Request>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginationProvider],
    }).compile();

    provider = module.get<PaginationProvider>(PaginationProvider);
  });

  describe('generatePaginationLinks', () => {
    it('should return correct links for the first page', () => {
      const result = provider.generatePaginationLinks(mockRequest, 5, 1, 10);

      expect(result).toEqual({
        first:
          'https://example.com/api/users?search=test&sort=name&page=1&limit=10',
        last: 'https://example.com/api/users?search=test&sort=name&page=5&limit=10',
        current:
          'https://example.com/api/users?search=test&sort=name&page=1&limit=10',
        next: 'https://example.com/api/users?search=test&sort=name&page=2&limit=10',
        previous: null,
      });
    });

    it('should return correct links for a middle page (with previous and next)', () => {
      const result = provider.generatePaginationLinks(mockRequest, 5, 3, 10);

      expect(result).toEqual({
        first:
          'https://example.com/api/users?search=test&sort=name&page=1&limit=10',
        last: 'https://example.com/api/users?search=test&sort=name&page=5&limit=10',
        current:
          'https://example.com/api/users?search=test&sort=name&page=3&limit=10',
        next: 'https://example.com/api/users?search=test&sort=name&page=4&limit=10',
        previous:
          'https://example.com/api/users?search=test&sort=name&page=2&limit=10',
      });
    });

    it('should return correct links for the last page', () => {
      const result = provider.generatePaginationLinks(mockRequest, 5, 5, 10);

      expect(result).toEqual({
        first:
          'https://example.com/api/users?search=test&sort=name&page=1&limit=10',
        last: 'https://example.com/api/users?search=test&sort=name&page=5&limit=10',
        current:
          'https://example.com/api/users?search=test&sort=name&page=5&limit=10',
        next: null,
        previous:
          'https://example.com/api/users?search=test&sort=name&page=4&limit=10',
      });
    });

    it('should return null links when totalPages is 0', () => {
      const result = provider.generatePaginationLinks(mockRequest, 0, 1, 10);

      expect(result).toEqual({
        first: null,
        last: null,
        current: null,
        next: null,
        previous: null,
      });
    });

    it('should return null links when totalPages is less than 1', () => {
      const result = provider.generatePaginationLinks(mockRequest, -1, 1, 10);

      expect(result).toEqual({
        first: null,
        last: null,
        current: null,
        next: null,
        previous: null,
      });
    });

    it('should return null links when currentPage is less than 1', () => {
      const result = provider.generatePaginationLinks(mockRequest, 5, 0, 10);

      expect(result).toEqual({
        first: null,
        last: null,
        current: null,
        next: null,
        previous: null,
      });
    });

    it('should handle single page scenario correctly', () => {
      const result = provider.generatePaginationLinks(mockRequest, 1, 1, 10);

      expect(result).toEqual({
        first:
          'https://example.com/api/users?search=test&sort=name&page=1&limit=10',
        last: 'https://example.com/api/users?search=test&sort=name&page=1&limit=10',
        current:
          'https://example.com/api/users?search=test&sort=name&page=1&limit=10',
        next: null,
        previous: null,
      });
    });

    it('should handle request without query parameters', () => {
      mockRequest.query = {};

      const result = provider.generatePaginationLinks(mockRequest, 3, 2, 5);

      expect(result).toEqual({
        first: 'https://example.com/api/users?page=1&limit=5',
        last: 'https://example.com/api/users?page=3&limit=5',
        current: 'https://example.com/api/users?page=2&limit=5',
        next: 'https://example.com/api/users?page=3&limit=5',
        previous: 'https://example.com/api/users?page=1&limit=5',
      });
    });

    it('should handle http protocol correctly', () => {
      mockRequest = {
        ...mockRequest,
        protocol: 'http',
      } as any as jest.Mocked<Request>;
      mockRequest.get = jest.fn().mockReturnValue('localhost:3000');

      const result = provider.generatePaginationLinks(mockRequest, 2, 1, 20);

      expect(result.first).toBe(
        'http://localhost:3000/api/users?search=test&sort=name&page=1&limit=20',
      );
    });
  });
});
