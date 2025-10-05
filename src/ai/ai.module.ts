import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './providers/ai.service';
import { OpenRouterProvider } from './providers/open-router.provider';

@Module({
  controllers: [AiController],
  providers: [AiService, OpenRouterProvider],
})
export class AiModule {}
