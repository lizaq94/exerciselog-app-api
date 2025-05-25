import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';
import { DatabaseService } from '../database/database.service';
import { SetsService } from '../sets/sets.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';

describe('ExercisesService', () => {
  let service: ExercisesService;

  const mockDatabaseService = {
    exercise: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSetsService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockWorkoutId = 'workout-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: SetsService, useValue: mockSetsService },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all exercises for a given workoutId', async () => {
      const mockExercises = [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          order: 1,
          type: 'Strength',
          workoutId: mockWorkoutId,
        },
        {
          id: 'exercise-2',
          name: 'Squat',
          order: 2,
          type: 'Strength',
          workoutId: mockWorkoutId,
        },
      ];
      mockDatabaseService.exercise.findMany.mockResolvedValue(mockExercises);

      const result = await service.findAll(mockWorkoutId);
      expect(result).toEqual(mockExercises);
      expect(mockDatabaseService.exercise.findMany).toHaveBeenCalledWith({
        where: { workoutId: mockWorkoutId },
      });
    });
    it('should return an empty array when no exercises exist for the given workoutId', async () => {
      mockDatabaseService.exercise.findMany.mockResolvedValue([]);

      const result = await service.findAll(mockWorkoutId);
      expect(result).toEqual([]);
      expect(mockDatabaseService.exercise.findMany).toHaveBeenCalledWith({
        where: { workoutId: mockWorkoutId },
      });
    });
    it('should handle database errors properly', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseService.exercise.findMany.mockRejectedValue(dbError);

      await expect(service.findAll(mockWorkoutId)).rejects.toThrow(dbError);
      expect(mockDatabaseService.exercise.findMany).toHaveBeenCalledWith({
        where: { workoutId: mockWorkoutId },
      });
    });
  });

  describe('create', () => {
    it('should create a new exercise with valid workoutId and exercise data', async () => {
      const mockCreateExerciseDto: CreateExerciseDto = {
        name: 'Bench Press',
        order: 1,
        type: 'Strength',
        notes: 'Focus on controlled movement',
      };
      const mockExercise = {
        id: 'exercise-id',
        workoutId: mockWorkoutId,
        ...mockCreateExerciseDto,
      };

      mockDatabaseService.exercise.create.mockResolvedValue(mockExercise);
      const result = await service.create(mockWorkoutId, mockCreateExerciseDto);
      expect(result).toEqual(mockExercise);
      expect(mockDatabaseService.exercise.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateExerciseDto,
          workout: {
            connect: { id: mockWorkoutId },
          },
        },
      });
    });

    it('should handle database errors properly', async () => {
      const mockCreateExerciseDto: CreateExerciseDto = {
        name: 'Deadlift',
        order: 4,
        type: 'Compound',
        notes: 'Lift with legs not back',
      };

      const dbError = new Error('Database connection failed');
      mockDatabaseService.exercise.create.mockRejectedValue(dbError);

      await expect(
        service.create(mockWorkoutId, mockCreateExerciseDto),
      ).rejects.toThrow(dbError);

      expect(mockDatabaseService.exercise.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateExerciseDto,
          workout: {
            connect: { id: mockWorkoutId },
          },
        },
      });
    });
  });
});
