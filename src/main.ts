import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config';

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
  SwaggerModule.setup('api', app, document);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
