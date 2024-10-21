import { Injectable } from '@nestjs/common';
import { UserEntity } from '../users/entities/user.entity';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { WorkoutEntity } from '../workouts/entities/workout.entity';
import { ExerciseEntity } from '../exercises/entities/exercise.entity';
import { SetEntity } from '../sets/entities/set.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = InferSubjects<
  | typeof UserEntity
  | typeof WorkoutEntity
  | typeof ExerciseEntity
  | typeof SetEntity
  | 'all'
>;

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  defineAbility(user: UserEntity) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    can(Action.Manage, WorkoutEntity, { userId: user.id });

    can(Action.Manage, ExerciseEntity, {
      workoutId: {
        $in: user.workouts.map((workout) => workout.id),
      },
    });

    const allUserExercisesIds = [];

    user?.workouts?.forEach((workout) => {
      if (workout.exercises?.length)
        allUserExercisesIds.push(...workout.exercises);
    });

    can(Action.Manage, SetEntity, { exerciseId: { $in: allUserExercisesIds } });

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
