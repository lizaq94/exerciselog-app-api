import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { Action, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { OwnershipGuard } from '../casl/guards/ownership.guard';
import { Resource } from '../casl/types/resource.type';
import { LoggerService } from '../logger/logger.service';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';

const mockCaslAbilityFactory = {
  createForUser: jest.fn(),
};

const mockWorkoutsService = {
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAllExercise: jest.fn(),
  addExercise: jest.fn(),
};

const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('WorkoutsController', () => {
  let controller: WorkoutsController;
  let workoutsService: WorkoutsService;
  let loggerService: LoggerService;

  const workoutId = '22f0dd54-7acd-476f-9fc9-140bb5cb8b20';
  const dummyWorkout = {
    id: workoutId,
    name: 'Test Workout',
    date: '2023-10-21T10:00:00.000Z',
    userId: 'user-4567-e89b-12d3-a456-426614174001',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutsController],
      providers: [
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },
        { provide: WorkoutsService, useValue: mockWorkoutsService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    controller = module.get<WorkoutsController>(WorkoutsController);
    workoutsService = module.get<WorkoutsService>(WorkoutsService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return workout corresponding to the provided id', async () => {
      (workoutsService.findOne as jest.Mock).mockReturnValueOnce(dummyWorkout);

      const result = await controller.findOne(workoutId);

      expect(workoutsService.findOne).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(dummyWorkout);
    });

    it('should log information about fetching the workout ', async () => {
      (workoutsService.findOne as jest.Mock).mockReturnValueOnce(dummyWorkout);

      await controller.findOne(workoutId);

      expect(loggerService.log).toHaveBeenCalledWith(
        `Fetching workout with ID: ${workoutId}`,
        WorkoutsController.name,
      );
    });

    it('should propagate error when service throws an exception', async () => {
      const error = new Error('Service error');
      (workoutsService.findOne as jest.Mock).mockRejectedValue(error);

      await expect(controller.findOne(workoutId)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should successfully update workout when valid data is provided', async () => {
      const updateWorkoutDto = {
        name: 'Updated Workout',
      };

      const dummyUpdateWorkout = {
        id: workoutId,
        name: 'Updated Workout',
        date: '2023-10-21T10:00:00.000Z',
        userId: 'user-4567-e89b-12d3-a456-426614174001',
      };

      (workoutsService.update as jest.Mock).mockReturnValueOnce(
        dummyUpdateWorkout,
      );

      const result = await controller.update(workoutId, updateWorkoutDto);

      expect(workoutsService.update).toHaveBeenCalledWith(
        workoutId,
        updateWorkoutDto,
      );
      expect(result).toEqual(dummyUpdateWorkout);
    });

    it('should throw NotFoundException when trying to update workout with invalid ID', async () => {
      const updateWorkoutDto = {
        name: 'Updated Workout',
      };

      const invalidId = 'invalid-id';

      (workoutsService.update as jest.Mock).mockRejectedValue(
        new NotFoundException(`Workout with ID ${invalidId} not found`),
      );

      await expect(
        controller.update(invalidId, updateWorkoutDto),
      ).rejects.toThrow(NotFoundException);

      expect(workoutsService.update).toHaveBeenCalledWith(
        invalidId,
        updateWorkoutDto,
      );
    });
    it('should throw ForbiddenException when user tries to update workout owned by another user', async () => {
      const updateWorkoutDto = {
        name: 'Updated Workout',
      };

      const testUser = {
        id: 'user-1234',
        workouts: [],
      };

      const anotherUserWorkout = {
        id: workoutId,
        name: 'Test Workout',
        date: '2023-10-21T10:00:00.000Z',
        userId: 'different-user-id',
      };

      const mockModuleRef = {
        resolve: jest.fn().mockImplementation((service) => {
          if (service === WorkoutsService) {
            return Promise.resolve(mockWorkoutsService);
          }
          throw new Error(`Unexpected service: ${service}`);
        }),
      };

      const mockAbility = {
        can: jest.fn().mockReturnValue(false),
      };

      const caslAbilityFactory = {
        defineAbility: jest.fn().mockReturnValue(mockAbility),
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: testUser,
            params: { id: workoutId },
          }),
        }),
        getHandler: jest.fn(),
      };

      const mockReflector = new Reflector();
      jest.spyOn(mockReflector, 'get').mockReturnValue(Resource.WORKOUT);

      (mockWorkoutsService.findOne as jest.Mock).mockResolvedValue(
        anotherUserWorkout,
      );

      const ownershipGuard = new OwnershipGuard(
        mockReflector,
        caslAbilityFactory,
        mockModuleRef as unknown as ModuleRef,
      );

      await expect(async () => {
        const canActivate = await ownershipGuard.canActivate(
          mockExecutionContext as any,
        );
        if (!canActivate) {
          throw new ForbiddenException('No permission to manage the resource.');
        }
        return controller.update(workoutId, updateWorkoutDto);
      }).rejects.toThrow(ForbiddenException);

      expect(mockWorkoutsService.findOne).toHaveBeenCalledWith(workoutId);
      expect(caslAbilityFactory.defineAbility).toHaveBeenCalledWith(testUser);
      expect(mockAbility.can).toHaveBeenCalledWith(
        Action.Manage,
        expect.any(Object),
      );
      expect(mockModuleRef.resolve).toHaveBeenCalledWith(WorkoutsService);
    });
  });

  describe('delete', () => {
    it('should successfully delete workout when valid ID is provided', async () => {
      (workoutsService.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await controller.delete(workoutId);
      expect(workoutsService.delete).toHaveBeenCalledWith(workoutId);
      expect(result).toBeUndefined();
    });
    it('should throw NotFoundException when trying to delete non-existing workout', async () => {
      const nonExistingId = 'non-existing-id';

      (workoutsService.delete as jest.Mock).mockRejectedValueOnce(
        new NotFoundException(`Workout not found or has been deleted`),
      );

      await expect(controller.delete(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
      expect(workoutsService.delete).toHaveBeenCalledWith(nonExistingId);
    });
    it('should throw ForbiddenException when user tries to delete workout owned by another user', async () => {
      const testUser = {
        id: 'user-1234',
        workouts: [],
      };

      const anotherUserWorkout = {
        id: workoutId,
        name: 'Test Workout',
        date: '2023-10-21T10:00:00.000Z',
        userId: 'different-user-id',
      };

      const mockModuleRef = {
        resolve: jest.fn().mockImplementation((service) => {
          if (service === WorkoutsService) {
            return Promise.resolve(mockWorkoutsService);
          }
          throw new Error(`Unexpected service: ${service}`);
        }),
      };

      const mockAbility = {
        can: jest.fn().mockReturnValue(false),
      };

      const caslAbilityFactory = {
        defineAbility: jest.fn().mockReturnValue(mockAbility),
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: testUser,
            params: { id: workoutId },
          }),
        }),
        getHandler: jest.fn(),
      };

      const mockReflector = new Reflector();
      jest.spyOn(mockReflector, 'get').mockReturnValue(Resource.WORKOUT);

      (mockWorkoutsService.findOne as jest.Mock).mockResolvedValue(
        anotherUserWorkout,
      );

      const ownershipGuard = new OwnershipGuard(
        mockReflector,
        caslAbilityFactory,
        mockModuleRef as unknown as ModuleRef,
      );

      await expect(async () => {
        const canActivate = await ownershipGuard.canActivate(
          mockExecutionContext as any,
        );
        if (!canActivate) {
          throw new ForbiddenException('No permission to manage the resource.');
        }
        return controller.delete(workoutId);
      }).rejects.toThrow(ForbiddenException);

      expect(mockWorkoutsService.findOne).toHaveBeenCalledWith(workoutId);
      expect(caslAbilityFactory.defineAbility).toHaveBeenCalledWith(testUser);
      expect(mockAbility.can).toHaveBeenCalledWith(
        Action.Manage,
        expect.any(Object),
      );
      expect(mockModuleRef.resolve).toHaveBeenCalledWith(WorkoutsService);
    });
    it('should log information when deleting workout', async () => {
      (workoutsService.delete as jest.Mock).mockReturnValueOnce(undefined);

      await controller.delete(workoutId);

      expect(loggerService.log).toHaveBeenCalledWith(
        `Deleting workout with ID: ${workoutId}`,
        WorkoutsController.name,
      );
    });
  });

  describe('findAllExercise', () => {
    const dummyExercise = [
      {
        id: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
      },
    ];
    it('should return all exercises for given workout ID', async () => {
      (workoutsService.findAllExercise as jest.Mock).mockReturnValueOnce(
        dummyExercise,
      );

      const result = await controller.findAllExercise(workoutId);

      expect(workoutsService.findAllExercise).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual(dummyExercise);
    });
    it('should throw NotFoundException when workout does not exist', async () => {
      const nonExistingWorkoutId = 'non-existing-id';

      (workoutsService.findAllExercise as jest.Mock).mockRejectedValue(
        new NotFoundException('Workout not found'),
      );

      await expect(
        controller.findAllExercise(nonExistingWorkoutId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.findAllExercise(nonExistingWorkoutId),
      ).rejects.toThrow('Workout not found');

      expect(workoutsService.findAllExercise).toHaveBeenCalledWith(
        nonExistingWorkoutId,
      );
    });
    it('should log information about fetching exercises', async () => {
      (workoutsService.findAllExercise as jest.Mock).mockReturnValueOnce(
        dummyExercise,
      );

      await controller.findAllExercise(workoutId);

      expect(loggerService.log).toHaveBeenCalledWith(
        `Retrieving exercises for workout ID: ${workoutId}`,
        WorkoutsController.name,
      );
    });
    it('should return empty array when workout has no exercises', async () => {
      (workoutsService.findAllExercise as jest.Mock).mockReturnValueOnce([]);

      const result = await controller.findAllExercise(workoutId);

      expect(workoutsService.findAllExercise).toHaveBeenCalledWith(workoutId);
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('addExercise', () => {
    const mockExercise = {
      id: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
      name: 'Bench Press',
      order: 1,
      type: 'Strength',
      notes: 'Focus on controlled movement',
      sets: [],
      workoutId: workoutId,
      createdAt: new Date('2025-01-01T12:34:56.789Z'),
      updatedAt: new Date('2025-01-15T08:21:45.123Z'),
    };

    it('should successfully add exercise to workout', async () => {
      (workoutsService.addExercise as jest.Mock).mockResolvedValue(
        mockExercise,
      );

      const result = await controller.addExercise(workoutId, mockExercise);

      expect(result).toEqual(mockExercise);
      expect(workoutsService.addExercise).toHaveBeenCalledWith(
        workoutId,
        mockExercise,
      );
      expect(result.workoutId).toBe(workoutId);
    });
    it('should throw NotFoundException when trying to add exercise to non-existing workout', async () => {
      const nonExistingWorkoutId = 'non-existing-id';

      (workoutsService.addExercise as jest.Mock).mockRejectedValue(
        new NotFoundException('Workout not found'),
      );

      await expect(
        controller.addExercise(nonExistingWorkoutId, mockExercise),
      ).rejects.toThrow(NotFoundException);
      expect(workoutsService.addExercise).toHaveBeenCalledWith(
        workoutId,
        mockExercise,
      );
    });
    it('should throw ForbiddenException when user tries to add exercise to workout owned by another user', async () => {
      const testUser = {
        id: 'user-1234',
        workouts: [],
      };

      const anotherUserWorkout = {
        id: workoutId,
        name: 'Test Workout',
        date: '2023-10-21T10:00:00.000Z',
        userId: 'different-user-id',
      };

      const mockModuleRef = {
        resolve: jest.fn().mockImplementation((service) => {
          if (service === WorkoutsService) {
            return Promise.resolve(mockWorkoutsService);
          }
          throw new Error(`Unexpected service: ${service}`);
        }),
      };

      const mockAbility = {
        can: jest.fn().mockReturnValue(false),
      };

      const caslAbilityFactory = {
        defineAbility: jest.fn().mockReturnValue(mockAbility),
      };

      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: testUser,
            params: { id: workoutId },
          }),
        }),
        getHandler: jest.fn(),
      };

      const mockReflector = new Reflector();
      jest.spyOn(mockReflector, 'get').mockReturnValue(Resource.WORKOUT);

      (mockWorkoutsService.findOne as jest.Mock).mockResolvedValue(
        anotherUserWorkout,
      );

      const ownershipGuard = new OwnershipGuard(
        mockReflector,
        caslAbilityFactory,
        mockModuleRef as unknown as ModuleRef,
      );

      await expect(async () => {
        const canActivate = await ownershipGuard.canActivate(
          mockExecutionContext as any,
        );
        if (!canActivate) {
          throw new ForbiddenException('No permission to manage the resource.');
        }
        return controller.addExercise(workoutId, mockExercise);
      }).rejects.toThrow(ForbiddenException);

      expect(mockWorkoutsService.findOne).toHaveBeenCalledWith(workoutId);
      expect(caslAbilityFactory.defineAbility).toHaveBeenCalledWith(testUser);
      expect(mockAbility.can).toHaveBeenCalledWith(
        Action.Manage,
        expect.any(Object),
      );
      expect(mockModuleRef.resolve).toHaveBeenCalledWith(WorkoutsService);
    });
    it('should log information about adding new exercise', async () => {
      (workoutsService.addExercise as jest.Mock).mockReturnValueOnce(
        mockExercise,
      );

      await controller.addExercise(workoutId, mockExercise);

      expect(loggerService.log).toHaveBeenCalledWith(
        `Adding new exercise to workut ID: ${workoutId}`,
        WorkoutsController.name,
      );
    });
    it('should throw BadRequestException when invalid exercise data is provided', async () => {
      const invalidExercise = {
        name: 'Bench Press',
        order: '23',
        type: 2,
        notes: 'Focus on controlled movement',
        sets: [],
        workoutId: workoutId,
      } as any;

      const expectedError = new BadRequestException('Invalid exercise data');
      (workoutsService.addExercise as jest.Mock).mockRejectedValue(
        expectedError,
      );

      await expect(
        controller.addExercise(workoutId, invalidExercise),
      ).rejects.toThrow(BadRequestException);

      expect(workoutsService.addExercise).toHaveBeenCalledWith(
        workoutId,
        invalidExercise,
      );
    });
  });
});
