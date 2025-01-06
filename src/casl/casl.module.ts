import { forwardRef, Module } from '@nestjs/common';
import { ExercisesModule } from '../exercises/exercises.module';
import { SetsModule } from '../sets/sets.module';
import { WorkoutsModule } from '../workouts/workouts.module';
import { CaslAbilityFactory } from './casl-ability.factory';
import { OwnershipGuard } from './guards/ownership.guard';

@Module({
  imports: [
    forwardRef(() => WorkoutsModule),
    forwardRef(() => ExercisesModule),
    forwardRef(() => SetsModule),
  ],
  providers: [CaslAbilityFactory, OwnershipGuard],
  exports: [CaslAbilityFactory, OwnershipGuard],
})
export class CaslModule {}
