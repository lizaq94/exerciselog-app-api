import { forwardRef, Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';

@Module({
  imports: [forwardRef(() => CaslModule)],
  controllers: [SetsController],
  providers: [SetsService],
  exports: [SetsService],
})
export class SetsModule {}
