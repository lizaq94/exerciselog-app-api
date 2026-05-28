import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';

type ErrorResponse = {
  apiVersion: string;
  error: {
    statusCode: number;
    message: string;
    timestamp: string;
    path: string;
  };
};

@Catch()
@Injectable()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponse = {
      apiVersion: process.env.APP_VERSION,
      error: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    let internalMessage: string = errorResponse.error.message;

    if (exception instanceof HttpException) {
      errorResponse.error.statusCode = exception.getStatus();
      const httpResponse = exception.getResponse();
      const clientMessage =
        typeof httpResponse === 'string'
          ? httpResponse
          : ((httpResponse as { message?: string | string[] })?.message ??
            exception.message);
      errorResponse.error.message = Array.isArray(clientMessage)
        ? clientMessage.join(', ')
        : clientMessage;
      internalMessage =
        typeof httpResponse === 'string'
          ? httpResponse
          : JSON.stringify(httpResponse);
    } else if (exception instanceof PrismaClientValidationError) {
      errorResponse.error.statusCode = 422;
      errorResponse.error.message = 'Validation error';
      internalMessage = exception.message.replace(/\n/g, '');
    } else if (exception instanceof PrismaClientKnownRequestError) {
      errorResponse.error.statusCode = 400;
      errorResponse.error.message = 'Database request error';
      internalMessage = `Database error [${exception.code}]: ${exception.message}`;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      errorResponse.error.statusCode = 500;
      errorResponse.error.message = 'Unknown database error';
      internalMessage = exception.message;
    } else if (exception instanceof Error) {
      internalMessage = exception.stack ?? exception.message;
    }

    response.status(errorResponse.error.statusCode).json(errorResponse);

    const isTestEnv = process.env.NODE_ENV === 'test';
    const isExpectedError =
      exception instanceof HttpException &&
      errorResponse.error.statusCode < 500;

    if (isTestEnv && isExpectedError) {
      this.logger.warn(
        `Expected test error: ${internalMessage}`,
        AllExceptionsFilter.name,
      );
    } else {
      this.logger.error(internalMessage, AllExceptionsFilter.name);
    }
  }
}
