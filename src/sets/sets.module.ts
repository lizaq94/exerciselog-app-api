import { forwardRef, Module } from '@nestjs/common';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';
import { ExercisesModule } from '../exercises/exercises.module';
import { WorkoutsModule } from '../workouts/workouts.module';

@Module({
  imports: [
    forwardRef(() => ExercisesModule),
    forwardRef(() => WorkoutsModule),
  ],
  controllers: [SetsController],
  providers: [SetsService],
  exports: [SetsService],
})
export class SetsModule {}
