import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SetsController],
  providers: [SetsService],
})
export class SetsModule {}
