import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { LoggerService } from '../../logger/logger.service';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let logger: LoggerService;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
  let mockRequest: jest.Mocked<Request>;
  let mockResponse: jest.Mocked<Response>;
  const originalApiVersion = process.env.APP_VERSION;

  beforeEach(async () => {
    process.env.APP_VERSION = '1.0.0';

    mockRequest = {
      url: '/test-path',
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllExceptionsFilter,
        {
          provide: LoggerService,
          useValue: {
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env.APP_VERSION = originalApiVersion;
  });

  describe('catch', () => {
    it('should handle HttpException, set response, and log the error', async () => {
      const httpException = new HttpException(
        'Test error message',
        HttpStatus.BAD_REQUEST,
      );
      const expectedResponse = {
        apiVersion: '1.0.0',
        error: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error message',
          timestamp: expect.any(String),
          path: '/test-path',
        },
      };

      await filter.catch(httpException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);

      expect(logger.warn).toHaveBeenCalledWith(
        'Expected test error: Test error message',
        AllExceptionsFilter.name,
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should mask PrismaClientValidationError details and return generic message', async () => {
      const prismaError = new PrismaClientValidationError(
        'Invalid `prisma.user.create()` invocation:\ncolumn "email" required',
        { clientVersion: '5.0.0' },
      );
      const expectedResponse = {
        apiVersion: '1.0.0',
        error: {
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Validation error',
          timestamp: expect.any(String),
          path: '/test-path',
        },
      };

      await filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);

      const responseBody = mockResponse.json.mock.calls[0][0] as {
        error: { message: string };
      };
      expect(responseBody.error.message.toLowerCase()).not.toContain('prisma');
      expect(responseBody.error.message.toLowerCase()).not.toContain('email');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('prisma'),
        AllExceptionsFilter.name,
      );
    });

    it('should mask PrismaClientKnownRequestError details and return generic message', async () => {
      const prismaError = new PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        { code: 'P2002', clientVersion: '5.0.0' },
      );
      const expectedResponse = {
        apiVersion: '1.0.0',
        error: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Database request error',
          timestamp: expect.any(String),
          path: '/test-path',
        },
      };

      await filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);

      const responseBody = mockResponse.json.mock.calls[0][0] as {
        error: { message: string };
      };
      expect(responseBody.error.message).not.toContain('email');
      expect(responseBody.error.message).not.toContain('P2002');

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('P2002'),
        AllExceptionsFilter.name,
      );
    });

    it('should handle PrismaClientUnknownRequestError with status 500, set response, and log the error', async () => {
      const prismaError = new PrismaClientUnknownRequestError(
        'Unknown database issue',
        { clientVersion: '5.0.0' },
      );
      const expectedResponse = {
        apiVersion: '1.0.0',
        error: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Unknown database error',
          timestamp: expect.any(String),
          path: '/test-path',
        },
      };

      await filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(logger.error).toHaveBeenCalledWith(
        'Unknown database issue',
        AllExceptionsFilter.name,
      );
    });

    it('should handle a generic Error with a 500 status, set response, and log the error', async () => {
      const genericError = new Error('Something went wrong');
      const expectedResponse = {
        apiVersion: '1.0.0',
        error: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
          timestamp: expect.any(String),
          path: '/test-path',
        },
      };

      await filter.catch(genericError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Something went wrong'),
        AllExceptionsFilter.name,
      );
    });

    it('should send the HTTP response exactly once (no double-send via super.catch)', async () => {
      const httpException = new HttpException('boom', HttpStatus.BAD_REQUEST);

      await filter.catch(httpException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });
});
