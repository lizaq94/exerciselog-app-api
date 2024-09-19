import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { WorkoutEntity } from '../../workouts/entities/workout.entity';
import { ExerciseEntity } from '../../exercises/entities/exercise.entity';
import { SetEntity } from '../../sets/entities/set.entity';

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
>;

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  defineAbility(user: UserEntity) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
