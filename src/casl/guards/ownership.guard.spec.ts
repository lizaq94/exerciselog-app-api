import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory, Action } from '../casl-ability.factory';
import { RESOURCE_TYPE_KEY } from '../decorators/resource-type.decorator';
import { Resource } from '../types/resource.type';
import { OwnershipGuard } from './ownership.guard';
import { WorkoutsService } from '../../workouts/workouts.service';
import { ExercisesService } from '../../exercises/exercises.service';
import { SetsService } from '../../sets/sets.service';
import { UsersService } from '../../users/users.service';
import { WorkoutEntity } from '../../workouts/entities/workout.entity';
import { ExerciseEntity } from '../../exercises/entities/exercise.entity';
import { SetEntity } from '../../sets/entities/set.entity';
import { UserEntity } from '../../users/entities/user.entity';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  let reflector: jest.Mocked<Reflector>;
  let caslAbilityFactory: jest.Mocked<CaslAbilityFactory>;
  let moduleRef: jest.Mocked<ModuleRef>;
  let workoutsService: jest.Mocked<WorkoutsService>;
  let exercisesService: jest.Mocked<ExercisesService>;
  let setsService: jest.Mocked<SetsService>;
  let usersService: jest.Mocked<UsersService>;
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

    const mockWorkoutsService = {
      findOne: jest.fn(),
    };

    const mockExercisesService = {
      findOne: jest.fn(),
    };

    const mockSetsService = {
      findOne: jest.fn(),
    };

    const mockUsersService = {
      findOneById: jest.fn(),
    };

    const mockReflector = {
      get: jest.fn(),
    };

    const mockCaslAbilityFactory = {
      defineAbility: jest.fn(),
    };

    const mockModuleRef = {
      resolve: jest.fn(),
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
        { provide: ModuleRef, useValue: mockModuleRef },
        { provide: WorkoutsService, useValue: mockWorkoutsService },
        { provide: ExercisesService, useValue: mockExercisesService },
        { provide: SetsService, useValue: mockSetsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    guard = module.get<OwnershipGuard>(OwnershipGuard);
    reflector = module.get(Reflector);
    caslAbilityFactory = module.get(CaslAbilityFactory);
    moduleRef = module.get(ModuleRef);
    workoutsService = module.get(WorkoutsService);
    exercisesService = module.get(ExercisesService);
    setsService = module.get(SetsService);
    usersService = module.get(UsersService);
    executionContext = mockExecutionContext as any;

    reflector.get.mockReturnValue(Resource.WORKOUT);
    caslAbilityFactory.defineAbility.mockReturnValue(mockAbility);
    mockAbility.can.mockReturnValue(true);
    moduleRef.resolve.mockImplementation((service) => {
      if (service === WorkoutsService) return Promise.resolve(workoutsService);
      if (service === ExercisesService)
        return Promise.resolve(exercisesService);
      if (service === SetsService) return Promise.resolve(setsService);
      if (service === UsersService) return Promise.resolve(usersService);
      return Promise.resolve({});
    });
    workoutsService.findOne.mockResolvedValue(testWorkout);
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

    it('should throw ForbiddenException when the requested resource is not found', async () => {
      workoutsService.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('Resource not found.'),
      );

      expect(workoutsService.findOne).toHaveBeenCalledWith('resource-1');
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
        moduleRef.resolve.mockResolvedValue(workoutsService);
        workoutsService.findOne.mockResolvedValue(testWorkout);
      });

      it('should correctly resolve WorkoutsService and call findOne', async () => {
        await guard.canActivate(executionContext);

        expect(moduleRef.resolve).toHaveBeenCalledWith(WorkoutsService);
        expect(workoutsService.findOne).toHaveBeenCalledWith('resource-1');
        expect(mockAbility.can).toHaveBeenCalledWith(
          Action.Manage,
          expect.any(WorkoutEntity),
        );
      });
    });

    describe('when resource type is EXERCISE', () => {
      beforeEach(() => {
        reflector.get.mockReturnValue(Resource.EXERCISE);
        moduleRef.resolve.mockResolvedValue(exercisesService);
        exercisesService.findOne.mockResolvedValue(testExercise);
      });

      it('should correctly resolve ExercisesService and call findOne', async () => {
        await guard.canActivate(executionContext);

        expect(moduleRef.resolve).toHaveBeenCalledWith(ExercisesService);
        expect(exercisesService.findOne).toHaveBeenCalledWith('resource-1');
        expect(mockAbility.can).toHaveBeenCalledWith(
          Action.Manage,
          expect.any(ExerciseEntity),
        );
      });
    });

    describe('when resource type is SET', () => {
      beforeEach(() => {
        reflector.get.mockReturnValue(Resource.SET);
        moduleRef.resolve.mockResolvedValue(setsService);
        setsService.findOne.mockResolvedValue(testSet);
      });

      it('should correctly resolve SetsService and call findOne', async () => {
        await guard.canActivate(executionContext);

        expect(moduleRef.resolve).toHaveBeenCalledWith(SetsService);
        expect(setsService.findOne).toHaveBeenCalledWith('resource-1');
        expect(mockAbility.can).toHaveBeenCalledWith(
          Action.Manage,
          expect.any(SetEntity),
        );
      });
    });

    describe('when resource type is USER', () => {
      beforeEach(() => {
        reflector.get.mockReturnValue(Resource.USER);
        moduleRef.resolve.mockResolvedValue(usersService);
        usersService.findOneById.mockResolvedValue(testUser);
      });

      it('should correctly resolve UsersService and call findOneById', async () => {
        await guard.canActivate(executionContext);

        expect(moduleRef.resolve).toHaveBeenCalledWith(UsersService);
        expect(usersService.findOneById).toHaveBeenCalledWith('resource-1');
        expect(mockAbility.can).toHaveBeenCalledWith(
          Action.Manage,
          expect.any(UserEntity),
        );
      });
    });
  });

  describe('getService', () => {
    it('should return WorkoutsService for WORKOUT resource', async () => {
      moduleRef.resolve.mockResolvedValue(workoutsService);

      const service = await (guard as any).getService(Resource.WORKOUT);

      expect(service).toBe(workoutsService);
      expect(moduleRef.resolve).toHaveBeenCalledWith(WorkoutsService);
    });

    it('should return ExercisesService for EXERCISE resource', async () => {
      moduleRef.resolve.mockResolvedValue(exercisesService);

      const service = await (guard as any).getService(Resource.EXERCISE);

      expect(service).toBe(exercisesService);
      expect(moduleRef.resolve).toHaveBeenCalledWith(ExercisesService);
    });

    it('should return SetsService for SET resource', async () => {
      moduleRef.resolve.mockResolvedValue(setsService);

      const service = await (guard as any).getService(Resource.SET);

      expect(service).toBe(setsService);
      expect(moduleRef.resolve).toHaveBeenCalledWith(SetsService);
    });

    it('should return UsersService for USER resource', async () => {
      moduleRef.resolve.mockResolvedValue(usersService);

      const service = await (guard as any).getService(Resource.USER);

      expect(service).toBe(usersService);
      expect(moduleRef.resolve).toHaveBeenCalledWith(UsersService);
    });

    it('should throw ForbiddenException for invalid resource type', async () => {
      await expect((guard as any).getService('INVALID')).rejects.toThrow(
        new ForbiddenException('Invalid resource type.'),
      );
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
      workoutsService.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(executionContext)).rejects.toThrow(
        new ForbiddenException('Resource not found.'),
      );

      expect(workoutsService.findOne).toHaveBeenCalledWith(undefined);
    });

    it('should handle service throwing error', async () => {
      workoutsService.findOne.mockRejectedValue(new Error('Database error'));

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
