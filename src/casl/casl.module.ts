import { forwardRef, Module } from '@nestjs/common';
import { ExercisesModule } from '../exercises/exercises.module';
import { SetsModule } from '../sets/sets.module';
import { WorkoutsModule } from '../workouts/workouts.module';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [
    forwardRef(() => ExercisesModule),
    forwardRef(() => WorkoutsModule),
    forwardRef(() => SetsModule),
  ],
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
