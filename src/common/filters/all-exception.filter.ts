import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

type ResponseObject = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class AllExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const responseObject: ResponseObject = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: 'Internal Server Error',
    };

    if (exception instanceof HttpException) {
      responseObject.statusCode = exception.getStatus();
      responseObject.response = exception.getResponse();
    } else if (exception instanceof PrismaClientValidationError) {
      responseObject.statusCode = 422;
      responseObject.response = exception.message.replace(/\n/g, '');
    } else if (exception instanceof PrismaClientKnownRequestError) {
      responseObject.statusCode = 400;
      responseObject.response = `Database error: ${exception.message}`;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      responseObject.statusCode = 500;
      responseObject.response = 'Unknown database error';
    }

    response.status(responseObject.statusCode).json(responseObject);

    super.catch(exception, host);
  }
}
