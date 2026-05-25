import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { SetsModule } from '../sets/sets.module';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [SetsModule, LoggerModule, UploadsModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
