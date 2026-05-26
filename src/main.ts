import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createApp } from './app.create';
import ConfigService from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  createApp(app);

  const configService = app.get(ConfigService);
  const port = configService.getAppConfig().port;

  await app.listen(port);
}
bootstrap();
