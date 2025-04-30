import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { LoggerService } from '../logger/logger.service';
import { Action, CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OwnershipGuard } from '../casl/guards/ownership.guard';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Resource } from '../casl/types/resource.type';

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

    //it('should return updated workout object with correct properties')
  });
});
