import { Module } from '@nestjs/common';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { SetsModule } from '../sets/sets.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [SetsModule, CaslModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
