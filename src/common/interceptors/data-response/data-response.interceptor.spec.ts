import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { DataResponseInterceptor } from './data-response.interceptor';

describe('DataResponseInterceptor', () => {
  let interceptor: DataResponseInterceptor;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;
  let testData: any;

  beforeEach(async () => {
    process.env.APP_VERSION = '1.0.0';

    testData = {
      id: 1,
      name: 'Test Data',
      items: ['item1', 'item2'],
    };

    mockExecutionContext = {} as jest.Mocked<ExecutionContext>;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of(testData)),
    } as jest.Mocked<CallHandler>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [DataResponseInterceptor],
    }).compile();

    interceptor = module.get<DataResponseInterceptor>(DataResponseInterceptor);
  });

  describe('intercept', () => {
    it('should wrap the response data within a DataResponseDto structure', (done) => {
      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (response) => {
          expect(response).toEqual({
            apiVersion: '1.0.0',
            data: testData,
          });
          expect(mockCallHandler.handle).toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it('should include the correct apiVersion from environment variables', (done) => {
      process.env.APP_VERSION = '2.1.5';

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (response) => {
          expect(response.apiVersion).toBe('2.1.5');
          expect(response.data).toEqual(testData);
          done();
        },
        error: done,
      });
    });

    it('should handle undefined APP_VERSION environment variable', (done) => {
      delete process.env.APP_VERSION;

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (response) => {
          expect(response.apiVersion).toBeUndefined();
          expect(response.data).toEqual(testData);
          done();
        },
        error: done,
      });
    });

    it('should handle null data response', (done) => {
      delete process.env.APP_VERSION;
      mockCallHandler.handle.mockReturnValue(of(null));

      const result$ = interceptor.intercept(
        mockExecutionContext,
        mockCallHandler,
      );

      result$.subscribe({
        next: (response) => {
          expect(response).toEqual({
            apiVersion: undefined,
            data: null,
          });
          done();
        },
        error: done,
      });
    });
  });
});
