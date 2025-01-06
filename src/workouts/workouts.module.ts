import { forwardRef, Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';

@Module({
  imports: [ExercisesModule, forwardRef(() => CaslModule)],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
