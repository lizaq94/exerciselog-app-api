import { forwardRef, Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { PaginationModule } from '../common/pagination/pagination.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { LoggerModule } from '../logger/logger.module';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';

@Module({
  imports: [
    ExercisesModule,
    LoggerModule,
    PaginationModule,
    forwardRef(() => CaslModule),
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
