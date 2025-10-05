import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';
import { AiService } from './providers/ai.service';
import { OpenRouterProvider } from './providers/open-router.provider';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [HttpModule, LoggerModule],
  controllers: [AiController],
  providers: [AiService, OpenRouterProvider],
})
export class AiModule {}
