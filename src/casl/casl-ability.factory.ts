import { InferSubjects } from '@casl/ability';
import { createPrismaAbility, PrismaAbility } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { ExerciseEntity } from '../exercises/entities/exercise.entity';
import { SetEntity } from '../sets/entities/set.entity';
import { UserEntity } from '../users/entities/user.entity';
import { WorkoutEntity } from '../workouts/entities/workout.entity';

export enum Action {
  Manage = 'manage',
}

export type Subjects = InferSubjects<
  | typeof UserEntity
  | typeof WorkoutEntity
  | typeof ExerciseEntity
  | typeof SetEntity
>;

export type AppAbility = PrismaAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  defineAbility(user: UserEntity): AppAbility {
    const allUserWorkoutIds = user.workouts.map((workout) => workout.id);
    const allUserExercisesIds = user.workouts.flatMap(
      (workout) => workout.exercises?.map((exercise) => exercise.id) || [],
    );

    return createPrismaAbility<[Action, Subjects]>([
      {
        action: Action.Manage,
        subject: UserEntity,
        conditions: { id: user.id },
      },
      {
        action: Action.Manage,
        subject: WorkoutEntity,
        conditions: { userId: user.id },
      },
      {
        action: Action.Manage,
        subject: ExerciseEntity,
        conditions: { workoutId: { in: allUserWorkoutIds } },
      },
      {
        action: Action.Manage,
        subject: SetEntity,
        conditions: { exerciseId: { in: allUserExercisesIds } },
      },
    ]);
  }
}
