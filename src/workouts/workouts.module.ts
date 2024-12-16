import { Module } from '@nestjs/common';
import { ExercisesModule } from '../exercises/exercises.module';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';

@Module({
  imports: [ExercisesModule],
  controllers: [WorkoutsController],
  providers: [
    WorkoutsService,
    { provide: 'WorkoutsService', useClass: WorkoutsService },
  ],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
