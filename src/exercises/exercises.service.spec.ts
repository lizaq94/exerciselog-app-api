import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';
import { DatabaseService } from '../database/database.service';
import { SetsService } from '../sets/sets.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseEntity } from './entities/exercise.entity';

describe('ExercisesService', () => {
  let service: ExercisesService;

  const mockWorkoutId = 'workout-id';
  const mockExerciseId = 'exercise-id';
  const mockDates = {
    createdAt: new Date('2025-01-01T12:34:56.789Z'),
    updatedAt: new Date('2025-01-15T08:21:45.123Z'),
  };

  const createMockExercise = (overrides = {}): ExerciseEntity => ({
    id: mockExerciseId,
    name: 'Bench Press',
    order: 1,
    type: 'Strength',
    notes: 'Focus on controlled movement',
    workoutId: mockWorkoutId,
    ...mockDates,
    ...overrides,
  });

  const createMockExerciseDto = (): CreateExerciseDto => ({
    name: 'Bench Press',
    order: 1,
    type: 'Strength',
    notes: 'Focus on controlled movement',
  });

  const mockDbError = new Error('Database connection failed');

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

  beforeEach(async () => {
    jest.clearAllMocks();
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
        createMockExercise({ id: 'exercise-1' }),
        createMockExercise({ id: 'exercise-2', name: 'Squat', order: 2 }),
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
      mockDatabaseService.exercise.findMany.mockRejectedValue(mockDbError);

      await expect(service.findAll(mockWorkoutId)).rejects.toThrow(mockDbError);
      expect(mockDatabaseService.exercise.findMany).toHaveBeenCalledWith({
        where: { workoutId: mockWorkoutId },
      });
    });
  });

  describe('create', () => {
    it('should create a new exercise with valid workoutId and exercise data', async () => {
      const mockCreateExerciseDto = createMockExerciseDto();
      const mockExercise = createMockExercise();

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
      const mockCreateExerciseDto = createMockExerciseDto();
      mockCreateExerciseDto.name = 'Deadlift';
      mockCreateExerciseDto.order = 4;
      mockCreateExerciseDto.type = 'Compound';
      mockCreateExerciseDto.notes = 'Lift with legs not back';

      mockDatabaseService.exercise.create.mockRejectedValue(mockDbError);

      await expect(
        service.create(mockWorkoutId, mockCreateExerciseDto),
      ).rejects.toThrow(mockDbError);

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

  describe('findOne', () => {
    it('should return an exercise when a valid id is provided', async () => {
      const mockExercise = createMockExercise();
      mockDatabaseService.exercise.findUnique.mockResolvedValue(mockExercise);

      const result = await service.findOne(mockExerciseId);
      expect(result).toEqual(mockExercise);
      expect(mockDatabaseService.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        include: {
          sets: true,
        },
      });
    });

    it('should throw NotFoundException when exercise with given id does not exist', async () => {
      const wrongExerciseId = 'wrong-exercise-id';
      const error = new NotFoundException('Exercise not found');

      mockDatabaseService.exercise.findUnique.mockResolvedValue(null);

      await expect(service.findOne(wrongExerciseId)).rejects.toThrow(error);
      expect(mockDatabaseService.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: wrongExerciseId },
        include: { sets: true },
      });
    });

    it('should handle database errors properly', async () => {
      mockDatabaseService.exercise.findUnique.mockRejectedValue(mockDbError);

      await expect(service.findOne(mockExerciseId)).rejects.toThrow(
        mockDbError,
      );
      expect(mockDatabaseService.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        include: { sets: true },
      });
    });
  });

  describe('update', () => {
    const mockUpdateExerciseDto = {
      name: 'Incline Bench Press',
      order: 2,
      type: 'Strength',
    };

    it('should successfully update an exercise when valid id and data are provided', async () => {
      const mockExercise = createMockExercise();
      const updatedExercise = { ...mockExercise, ...mockUpdateExerciseDto };

      mockDatabaseService.exercise.findUnique.mockResolvedValue(mockExercise);
      mockDatabaseService.exercise.update.mockResolvedValue(updatedExercise);

      const result = await service.update(
        mockExerciseId,
        mockUpdateExerciseDto,
      );

      expect(result).toEqual(updatedExercise);
      expect(mockDatabaseService.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        include: { sets: true },
      });
      expect(mockDatabaseService.exercise.update).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        data: mockUpdateExerciseDto,
      });
    });

    it('should throw NotFoundException when exercise with given id does not exist', async () => {
      mockDatabaseService.exercise.findUnique.mockResolvedValue(null);

      await expect(
        service.update(mockExerciseId, mockUpdateExerciseDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockDatabaseService.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        include: { sets: true },
      });
      expect(mockDatabaseService.exercise.update).not.toHaveBeenCalled();
    });

    it('should handle database errors properly', async () => {
      const mockExercise = createMockExercise();
      mockDatabaseService.exercise.findUnique.mockResolvedValue(mockExercise);
      mockDatabaseService.exercise.update.mockRejectedValue(mockDbError);

      await expect(
        service.update(mockExerciseId, mockUpdateExerciseDto),
      ).rejects.toThrow(mockDbError);

      expect(mockDatabaseService.exercise.findUnique).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        include: { sets: true },
      });
      expect(mockDatabaseService.exercise.update).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
        data: mockUpdateExerciseDto,
      });
    });
  });

  describe('delete', () => {
    it('should successfully delete an exercise when it exists', async () => {
      const mockExercise = createMockExercise();
      jest.spyOn(service, 'findOne').mockResolvedValue(mockExercise);
      mockDatabaseService.exercise.delete.mockResolvedValue(undefined);

      await service.delete(mockExerciseId);

      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockDatabaseService.exercise.delete).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
      });
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Exercise not found'));

      await expect(service.delete(mockExerciseId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockDatabaseService.exercise.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors properly during delete operation', async () => {
      const mockExercise = createMockExercise();
      jest.spyOn(service, 'findOne').mockResolvedValue(mockExercise);
      mockDatabaseService.exercise.delete.mockRejectedValue(mockDbError);

      await expect(service.delete(mockExerciseId)).rejects.toThrow(mockDbError);
      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockDatabaseService.exercise.delete).toHaveBeenCalledWith({
        where: { id: mockExerciseId },
      });
    });
  });

  describe('findAllSets', () => {
    it('should return all sets for a given exercise id', async () => {
      const mockExercise = createMockExercise();
      const mockSets = [
        {
          id: 'set-1',
          repetitions: 10,
          weight: 50,
          order: 1,
          exerciseId: mockExerciseId,
        },
        {
          id: 'set-2',
          repetitions: 8,
          weight: 55,
          order: 2,
          exerciseId: mockExerciseId,
        },
      ];

      jest.spyOn(service, 'findOne').mockResolvedValue(mockExercise);
      mockSetsService.findAll.mockResolvedValue(mockSets);

      const result = await service.findAllSets(mockExerciseId);

      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockSetsService.findAll).toHaveBeenCalledWith(mockExerciseId);
      expect(result).toEqual(mockSets);
    });

    it('should throw NotFoundException when exercise with given id does not exist', async () => {
      const mockExerciseId = 'wrong-exercise-id';

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Exercise not found'));

      await expect(service.findAllSets(mockExerciseId)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockSetsService.findAll).not.toHaveBeenCalled();
    });

    it('should handle errors thrown by setsService.findAll', async () => {
      const mockExercise = createMockExercise();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockExercise);
      mockSetsService.findAll.mockRejectedValue(mockDbError);

      await expect(service.findAllSets(mockExerciseId)).rejects.toThrow(
        mockDbError,
      );

      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockSetsService.findAll).toHaveBeenCalledWith(mockExerciseId);
    });
  });

  describe('addSet', () => {
    const mockCreateSetDto = {
      repetitions: 10,
      weight: 50,
      order: 1,
    };

    it('should add a new set to the exercise with the given id and set data', async () => {
      const mockExercise = createMockExercise();
      const mockSet = {
        id: 'set-1',
        ...mockCreateSetDto,
        exerciseId: mockExerciseId,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockExercise);
      mockSetsService.create.mockResolvedValue(mockSet);

      const result = await service.addSet(mockExerciseId, mockCreateSetDto);

      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockSetsService.create).toHaveBeenCalledWith(
        mockExerciseId,
        mockCreateSetDto,
      );
      expect(result).toEqual(mockSet);
    });

    it('should throw NotFoundException when exercise with given id does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Exercise not found'));

      await expect(
        service.addSet(mockExerciseId, mockCreateSetDto),
      ).rejects.toThrow(NotFoundException);

      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockSetsService.create).not.toHaveBeenCalled();
    });

    it('should handle errors thrown by setsService.create', async () => {
      const mockExercise = createMockExercise();
      jest.spyOn(service, 'findOne').mockResolvedValue(mockExercise);
      mockSetsService.create.mockRejectedValue(mockDbError);

      await expect(
        service.addSet(mockExerciseId, mockCreateSetDto),
      ).rejects.toThrow(mockDbError);
      expect(service.findOne).toHaveBeenCalledWith(mockExerciseId);
      expect(mockSetsService.create).toHaveBeenCalledWith(
        mockExerciseId,
        mockCreateSetDto,
      );
    });
  });
});
