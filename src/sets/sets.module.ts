import { forwardRef, Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { LoggerModule } from '../logger/logger.module';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';

@Module({
  imports: [LoggerModule, forwardRef(() => CaslModule)],
  controllers: [SetsController],
  providers: [SetsService],
  exports: [SetsService],
})
export class SetsModule {}
