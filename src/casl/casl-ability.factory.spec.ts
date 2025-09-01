import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory, Action } from './casl-ability.factory';
import { UserEntity } from '../users/entities/user.entity';
import { WorkoutEntity } from '../workouts/entities/workout.entity';
import { ExerciseEntity } from '../exercises/entities/exercise.entity';
import { SetEntity } from '../sets/entities/set.entity';

describe('CaslAbilityFactory', () => {
  let factory: CaslAbilityFactory;

  let testUser: UserEntity;
  let otherUser: UserEntity;
  let ownedWorkout: WorkoutEntity;
  let ownedExercise: ExerciseEntity;
  let ownedSet: SetEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaslAbilityFactory],
    }).compile();

    factory = module.get<CaslAbilityFactory>(CaslAbilityFactory);

    testUser = new UserEntity();
    testUser.id = 'user-1';

    otherUser = new UserEntity();
    otherUser.id = 'user-2';

    ownedWorkout = new WorkoutEntity();
    ownedWorkout.id = 'workout-1';
    ownedWorkout.userId = testUser.id;

    ownedExercise = new ExerciseEntity();
    ownedExercise.id = 'exercise-1';
    ownedExercise.workoutId = ownedWorkout.id;

    ownedSet = new SetEntity();
    ownedSet.id = 'set-1';
    ownedSet.exerciseId = ownedExercise.id;

    ownedWorkout.exercises = [ownedExercise];
    testUser.workouts = [ownedWorkout];
  });

  describe('defineAbility', () => {
    describe('UserEntity permissions', () => {
      it('should allow a user to manage their own UserEntity', () => {
        const ability = factory.defineAbility(testUser);
        expect(ability.can(Action.Manage, testUser)).toBe(true);
      });

      it('should NOT allow a user to manage another UserEntity', () => {
        const ability = factory.defineAbility(testUser);
        expect(ability.can(Action.Manage, otherUser)).toBe(false);
      });
    });

    describe('WorkoutEntity permissions', () => {
      it('should allow a user to manage their own workouts', () => {
        const ability = factory.defineAbility(testUser);
        expect(ability.can(Action.Manage, ownedWorkout)).toBe(true);
      });

      it('should NOT allow a user to manage workouts of another user', () => {
        const anotherUserWorkout = new WorkoutEntity();
        anotherUserWorkout.userId = otherUser.id;
        const ability = factory.defineAbility(testUser);
        expect(ability.can(Action.Manage, anotherUserWorkout)).toBe(false);
      });
    });

    describe('ExerciseEntity permissions', () => {
      it('should allow a user to manage exercises belonging to their own workouts', () => {
        const ability = factory.defineAbility(testUser);
        expect(ability.can(Action.Manage, ownedExercise)).toBe(true);
      });

      it("should NOT allow a user to manage exercises from another user's workout", () => {
        const anotherWorkoutExercise = new ExerciseEntity();
        anotherWorkoutExercise.workoutId = 'workout-2';
        const ability = factory.defineAbility(testUser);
        expect(ability.can(Action.Manage, anotherWorkoutExercise)).toBe(false);
      });
    });

    describe('SetEntity permissions', () => {
      it('should allow a user to manage sets belonging to their own exercises', () => {
        const ability = factory.defineAbility(testUser);
        expect(ability.can(Action.Manage, ownedSet)).toBe(true);
      });

      it("should NOT allow a user to manage sets from another user's exercises", () => {
        const anotherExerciseSet = new SetEntity();
        anotherExerciseSet.exerciseId = 'exercise-2';
        const ability = factory.defineAbility(testUser);
        expect(ability.can(Action.Manage, anotherExerciseSet)).toBe(false);
      });

      describe('edge cases', () => {
        it('should NOT allow managing a set when user has no workouts', () => {
          testUser.workouts = [];
          const ability = factory.defineAbility(testUser);
          expect(ability.can(Action.Manage, ownedSet)).toBe(false);
        });

        it('should NOT allow managing a set when workout has no exercises', () => {
          ownedWorkout.exercises = [];
          const ability = factory.defineAbility(testUser);
          expect(ability.can(Action.Manage, ownedSet)).toBe(false);
        });
      });
    });
  });
});
