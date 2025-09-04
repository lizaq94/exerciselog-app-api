import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createApp } from './app.create';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  createApp(app);
  await app.listen(3000);
}
bootstrap();
