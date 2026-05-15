import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';
import { AiService } from './providers/ai.service';
import { OpenRouterProvider } from './providers/open-router.provider';
import { LoggerModule } from '../logger/logger.module';
import { AiResponseParserService } from './services/ai-response-parser/ai-response-parser.service';
import { AiResponseTransformerService } from './services/ai-response-transformer/ai-response-transformer.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [HttpModule, LoggerModule, ConfigModule],
  controllers: [AiController],
  providers: [
    AiService,
    OpenRouterProvider,
    AiResponseParserService,
    AiResponseTransformerService,
  ],
})
export class AiModule {}
