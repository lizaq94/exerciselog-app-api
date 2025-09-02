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

  beforeEach(async () => {
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
          },
        },
      ],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    logger = module.get<LoggerService>(LoggerService);

    jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(filter)), 'catch')
      .mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch', () => {
    it('should handle HttpException, set response, and log the error', async () => {
      const httpException = new HttpException(
        'Test error message',
        HttpStatus.BAD_REQUEST,
      );
      const expectedResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-path',
        response: 'Test error message',
      };

      await filter.catch(httpException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);

      expect(logger.error).toHaveBeenCalledWith(
        'Test error message',
        AllExceptionsFilter.name,
      );
    });

    it('should handle PrismaClientValidationError with status 422, set response, and log the error', async () => {
      const prismaError = new PrismaClientValidationError(
        'Validation\nerror\nmessage',
        { clientVersion: '5.0.0' },
      );
      const expectedMessage = 'Validationerrormessage';
      const expectedResponse = {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        timestamp: expect.any(String),
        path: '/test-path',
        response: expectedMessage,
      };

      await filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(logger.error).toHaveBeenCalledWith(
        expectedMessage,
        AllExceptionsFilter.name,
      );
    });

    it('should handle PrismaClientKnownRequestError with status 400, set response, and log the error', async () => {
      const prismaError = new PrismaClientKnownRequestError(
        'Database constraint violation',
        { code: 'P2002', clientVersion: '5.0.0' },
      );
      const expectedMessage = 'Database error: Database constraint violation';
      const expectedResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test-path',
        response: expectedMessage,
      };

      await filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(logger.error).toHaveBeenCalledWith(
        expectedMessage,
        AllExceptionsFilter.name,
      );
    });

    it('should handle PrismaClientUnknownRequestError with status 500, set response, and log the error', async () => {
      const prismaError = new PrismaClientUnknownRequestError(
        'Unknown database issue',
        { clientVersion: '5.0.0' },
      );
      const expectedMessage = 'Unknown database error';
      const expectedResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-path',
        response: expectedMessage,
      };

      await filter.catch(prismaError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(logger.error).toHaveBeenCalledWith(
        expectedMessage,
        AllExceptionsFilter.name,
      );
    });

    it('should handle a generic Error with a 500 status, set response, and log the error', async () => {
      const genericError = new Error('Something went wrong');
      const expectedMessage = 'Internal Server Error';
      const expectedResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test-path',
        response: expectedMessage,
      };

      await filter.catch(genericError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse);
      expect(logger.error).toHaveBeenCalledWith(
        expectedMessage,
        AllExceptionsFilter.name,
      );
    });
  });
});
