import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DataResponseInterceptor } from './common/interceptors/data-response/data-response.interceptor';
import { LoggerService } from './logger/logger.service';
import ConfigService from './config/config.service';

export function createApp(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const { nodeEnv, corsOrigin } = configService.getAppConfig();

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Exerciselog')
      .setDescription(
        'API for managing exercise logs, including creating, updating, and retrieving workout sessions. Supports JWT-based authentication for secure access.',
      )
      .setVersion('0.1')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

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
  const logger = app.get(LoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.useGlobalInterceptors(new DataResponseInterceptor());
  app.enableCors({
    origin: nodeEnv === 'production' ? corsOrigin : true,
    credentials: true,
  });
}
