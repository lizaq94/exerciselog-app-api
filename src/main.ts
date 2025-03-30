import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DataResponseInterceptor } from './common/interceptors/data-response/data-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Exerciselog')
    .setDescription(
      'API for managing exercise logs, including creating, updating, and retrieving workout sessions. Supports JWT-based authentication for secure access.',
    )
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const { httpAdapter } = app.get(HttpAdapterHost);
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalInterceptors(new DataResponseInterceptor());
  await app.listen(3000);
}
bootstrap();
