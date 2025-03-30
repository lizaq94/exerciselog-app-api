import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import * as process from 'node:process';
import { DataResponseDto } from './data-response.dto';

@Injectable()
export class DataResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<DataResponseDto> {
    return next.handle().pipe(
      map((data) => ({
        apiVersion: process.env.APP_VERSION,
        data,
      })),
    );
  }
}
