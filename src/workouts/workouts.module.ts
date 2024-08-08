import { Module } from '@nestjs/common';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { DatabaseModule } from '../database/database.module';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [DatabaseModule, ExercisesModule],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
