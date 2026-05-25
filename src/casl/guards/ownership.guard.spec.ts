import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory, Action } from '../casl-ability.factory';
import { RESOURCE_TYPE_KEY } from '../decorators/resource-type.decorator';
import { Resource } from '../types/resource.type';
import { OwnershipGuard } from './ownership.guard';
import { DatabaseService } from '../../database/database.service';
import { WorkoutEntity } from '../../workouts/entities/workout.entity';
import { ExerciseEntity } from '../../exercises/entities/exercise.entity';
import { SetEntity } from '../../sets/entities/set.entity';
import { UserEntity } from '../../users/entities/user.entity';

type FindUniqueDelegate = { findUnique: jest.Mock };
type MockDatabaseService = {
  workout: FindUniqueDelegate;
  exercise: FindUniqueDelegate;
  set: FindUniqueDelegate;
  user: FindUniqueDelegate;
};

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let reflector: jest.Mocked<Reflector>;
  let caslAbilityFactory: jest.Mocked<CaslAbilityFactory>;
  let databaseService: MockDatabaseService;
  let executionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;
  let testUser: UserEntity;
  let testWorkout: WorkoutEntity;
  let testExercise: ExerciseEntity;
  let testSet: SetEntity;
  let mockAbility: any;

  beforeEach(async () => {
    testUser = new UserEntity();
    testUser.id = 'user-1';
    testUser.workouts = [];

    testWorkout = new WorkoutEntity();
    testWorkout.id = 'workout-1';
    testWorkout.userId = 'user-1';

    testExercise = new ExerciseEntity();
    testExercise.id = 'exercise-1';
    testExercise.workoutId = 'workout-1';

    testSet = new SetEntity();
    testSet.id = 'set-1';
    testSet.exerciseId = 'exercise-1';

    mockAbility = {
      can: jest.fn(),
    };

    mockRequest = {
      user: testUser,
      params: { id: 'resource-1' },
    };

    const mockReflector = {
      get: jest.fn(),
    };

    const mockCaslAbilityFactory = {
      defineAbility: jest.fn(),
    };

    const mockDatabaseService: MockDatabaseService = {
      workout: { findUnique: jest.fn() },
      exercise: { findUnique: jest.fn() },
      set: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipGuard,
        { provide: Reflector, useValue: mockReflector },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    guard = module.get<OwnershipGuard>(OwnershipGuard);
    reflector = module.get(Reflector);
    caslAbilityFactory = module.get(CaslAbilityFactory);
    databaseService = mockDatabaseService;
    executionContext = mockExecutionContext as any;

    reflector.get.mockReturnValue(Resource.WORKOUT);
    caslAbilityFactory.defineAbility.mockReturnValue(mockAbility);
    mockAbility.can.mockReturnValue(true);
    databaseService.workout.findUnique.mockResolvedValue(testWorkout);
  });

  describe('canActivate', () => {
    it('should return true when user has permission to manage the resource', async () => {
      const result = await guard.canActivate(executionContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(
        RESOURCE_TYPE_KEY,
        executionContext.getHandler(),
      );
      expect(caslAbilityFactory.defineAbility).toHaveBeenCalledWith(testUser);
      expect(mockAbility.can).toHaveBeenCalledWith(
        Action.Manage,
        expect.any(WorkoutEntity),
      );
    });

    it('should throw ForbiddenException when user does not have permission', async () => {
      mockAbility.can.mockReturnValue(false);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('No permission to manage the resource.'),
      );

      expect(mockAbility.can).toHaveBeenCalledWith(
        Action.Manage,
        expect.any(WorkoutEntity),
      );
    });

    it('should throw NotFoundException when the requested resource is not found', async () => {
      databaseService.workout.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new NotFoundException('Resource not found.'),
      );

      expect(databaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: 'resource-1' },
      });
    });

    it('should throw ForbiddenException when the user is not found in the request', async () => {
      mockRequest.user = null;

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('User not found'),
      );

      expect(caslAbilityFactory.defineAbility).not.toHaveBeenCalled();
    });

    it('should throw an error when resource type metadata is not set on the handler', async () => {
      reflector.get.mockReturnValue(null);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new Error('Resource type not specified.'),
      );

      expect(reflector.get).toHaveBeenCalledWith(
        RESOURCE_TYPE_KEY,
        executionContext.getHandler(),
      );
    });

    describe('when resource type is WORKOUT', () => {
      beforeEach(() => {
        reflector.get.mockReturnValue(Resource.WORKOUT);
        databaseService.workout.findUnique.mockResolvedValue(testWorkout);
      });

      it('should load the workout via DatabaseService and check ability', async () => {
        await guard.canActivate(executionContext);

        expect(databaseService.workout.findUnique).toHaveBeenCalledWith({
          where: { id: 'resource-1' },
        });
        expect(mockAbility.can).toHaveBeenCalledWith(
          Action.Manage,
          expect.any(WorkoutEntity),
        );
      });
    });

    describe('when resource type is EXERCISE', () => {
      beforeEach(() => {
        reflector.get.mockReturnValue(Resource.EXERCISE);
        databaseService.exercise.findUnique.mockResolvedValue(testExercise);
      });

      it('should load the exercise via DatabaseService and check ability', async () => {
        await guard.canActivate(executionContext);

        expect(databaseService.exercise.findUnique).toHaveBeenCalledWith({
          where: { id: 'resource-1' },
        });
        expect(mockAbility.can).toHaveBeenCalledWith(
          Action.Manage,
          expect.any(ExerciseEntity),
        );
      });
    });

    describe('when resource type is SET', () => {
      beforeEach(() => {
        reflector.get.mockReturnValue(Resource.SET);
        databaseService.set.findUnique.mockResolvedValue(testSet);
      });

      it('should load the set via DatabaseService and check ability', async () => {
        await guard.canActivate(executionContext);

        expect(databaseService.set.findUnique).toHaveBeenCalledWith({
          where: { id: 'resource-1' },
        });
        expect(mockAbility.can).toHaveBeenCalledWith(
          Action.Manage,
          expect.any(SetEntity),
        );
      });
    });

    describe('when resource type is USER', () => {
      beforeEach(() => {
        reflector.get.mockReturnValue(Resource.USER);
        databaseService.user.findUnique.mockResolvedValue(testUser);
      });

      it('should load the user via DatabaseService and check ability', async () => {
        await guard.canActivate(executionContext);

        expect(databaseService.user.findUnique).toHaveBeenCalledWith({
          where: { id: 'resource-1' },
        });
        expect(mockAbility.can).toHaveBeenCalledWith(
          Action.Manage,
          expect.any(UserEntity),
        );
      });
    });
  });

  describe('toEntity', () => {
    it('should convert resource to WorkoutEntity', () => {
      const resource = { id: 'workout-1', userId: 'user-1' };

      const entity = (guard as any).toEntity(resource, Resource.WORKOUT);

      expect(entity).toBeInstanceOf(WorkoutEntity);
      expect(entity.id).toBe('workout-1');
      expect(entity.userId).toBe('user-1');
    });

    it('should convert resource to ExerciseEntity', () => {
      const resource = { id: 'exercise-1', workoutId: 'workout-1' };

      const entity = (guard as any).toEntity(resource, Resource.EXERCISE);

      expect(entity).toBeInstanceOf(ExerciseEntity);
      expect(entity.id).toBe('exercise-1');
      expect(entity.workoutId).toBe('workout-1');
    });

    it('should convert resource to SetEntity', () => {
      const resource = { id: 'set-1', exerciseId: 'exercise-1' };

      const entity = (guard as any).toEntity(resource, Resource.SET);

      expect(entity).toBeInstanceOf(SetEntity);
      expect(entity.id).toBe('set-1');
      expect(entity.exerciseId).toBe('exercise-1');
    });

    it('should convert resource to UserEntity', () => {
      const resource = { id: 'user-1', email: 'test@example.com' };

      const entity = (guard as any).toEntity(resource, Resource.USER);

      expect(entity).toBeInstanceOf(UserEntity);
      expect(entity.id).toBe('user-1');
      expect(entity.email).toBe('test@example.com');
    });

    it('should throw error for unrecognized entity type', () => {
      const resource = { id: 'test' };

      expect(() =>
        (guard as any).toEntity(resource, 'INVALID' as Resource),
      ).toThrow(new Error('Entity type INVALID is not recognized.'));
    });
  });

  describe('edge cases', () => {
    it('should handle undefined user in request', async () => {
      mockRequest.user = undefined;

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('User not found'),
      );
    });

    it('should handle missing params.id in request', async () => {
      mockRequest.params = {};
      reflector.get.mockReturnValue(Resource.WORKOUT);
      databaseService.workout.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new NotFoundException('Resource not found.'),
      );

      expect(databaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: undefined },
      });
    });

    it('should handle database error when loading the resource', async () => {
      databaseService.workout.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new Error('Database error'),
      );
    });

    it('should handle ability factory throwing error', async () => {
      caslAbilityFactory.defineAbility.mockImplementation(() => {
        throw new Error('Ability creation failed');
      });

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new Error('Ability creation failed'),
      );
    });
  });
});
