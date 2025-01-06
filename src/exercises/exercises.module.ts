import { forwardRef, Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { SetsModule } from '../sets/sets.module';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';

@Module({
  imports: [SetsModule, forwardRef(() => CaslModule)],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
