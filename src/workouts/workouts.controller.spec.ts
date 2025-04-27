import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { LoggerService } from '../logger/logger.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';

const mockCaslAbilityFactory = {
  createForUser: jest.fn().mockReturnValue({}),
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
    const workoutId = '22f0dd54-7acd-476f-9fc9-140bb5cb8b20';
    const dummyWorkout = {
      id: workoutId,
      name: 'Test Workout',
      date: '2023-10-21T10:00:00.000Z',
      userId: 'user-4567-e89b-12d3-a456-426614174001',
    };

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
});
