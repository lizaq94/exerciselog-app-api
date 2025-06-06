import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationProvider } from '../common/pagination/pagination.provider';
import { DatabaseService } from '../database/database.service';
import { ExercisesService } from '../exercises/exercises.service';
import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  let service: WorkoutsService;

  const mockDatabaseService = {
    workout: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    exercise: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockExercisesService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockPaginationProvider = {
    generatePaginationLinks: jest.fn(),
  };

  const userId = 'test-user-id';
  const mockWorkoutId = 'test-workout-id';

  const mockWorkoutData = {
    id: 'workout-1',
    name: 'Strength Training',
    date: new Date('2023-10-21T10:00:00.000Z'),
    notes: 'Focus on upper body',
    duration: 60,
    userId: userId,
    createdAt: new Date('2023-10-21T09:00:00.000Z'),
    updatedAt: new Date('2023-10-21T11:00:00.000Z'),
    exercises: [],
  };

  const mockCreateWorkoutDto = {
    name: 'Test Workout',
    date: new Date(),
    notes: 'Test notes',
    duration: 45,
  };

  const mockCreateExerciseDto = {
    name: 'Push-ups',
    order: 1,
    type: 'Bodyweight',
    notes: 'Test notes',
  };

  const mockLinks = {
    first: 'http://localhost:3000/workouts?page=1&limit=10',
    last: 'http://localhost:3000/workouts?page=1&limit=10',
    current: 'http://localhost:3000/workouts?page=1&limit=10',
    next: null,
    previous: null,
  };

  const mockRequest = {
    protocol: 'http',
    get: jest.fn().mockReturnValue('localhost:3000'),
    path: '/workouts',
    query: { page: 1, limit: 10 },
  };

  const databaseError = new Error('Database connection failed');
  const exerciseError = new Error('Failed to fetch exercises');
  const updateWorkoutDto = {
    name: 'Updated Workout',
    date: new Date(),
    notes: 'Updated notes',
    duration: 45,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ExercisesService, useValue: mockExercisesService },
        { provide: PaginationProvider, useValue: mockPaginationProvider },
      ],
    }).compile();

    service = module.get<WorkoutsService>(WorkoutsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const paginationDto = { page: 1, limit: 10 };

    const mockWorkoutsData = [mockWorkoutData];

    const mockPaginationResult = {
      data: mockWorkoutsData,
      meta: {
        total: 1,
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        next: null,
        prev: null,
      },
    };

    it('should return paginated workouts for a given user', async () => {
      jest.mock('@nodeteam/nestjs-prisma-pagination', () => ({
        paginator: jest.fn().mockReturnValue(() => mockPaginationResult),
      }));

      mockPaginationProvider.generatePaginationLinks.mockReturnValue(mockLinks);

      mockDatabaseService.workout.findMany.mockResolvedValue(mockWorkoutsData);
      mockDatabaseService.workout.count.mockResolvedValue(1);

      const result = await service.findAll(
        userId,
        paginationDto,
        mockRequest as any,
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result).toHaveProperty('links');

      expect(result.data).toEqual(mockWorkoutsData);
      expect(result.meta).toEqual(mockPaginationResult.meta);
      expect(result.links).toEqual(mockLinks);

      expect(
        mockPaginationProvider.generatePaginationLinks,
      ).toHaveBeenCalledWith(
        mockRequest,
        mockPaginationResult.meta.lastPage,
        paginationDto.page,
        paginationDto.limit,
      );
    });

    it('should properly transform the pagination result to include links', async () => {
      const paginationResultWithoutLinks = {
        data: mockWorkoutData,
        meta: {
          total: 15,
          currentPage: 2,
          lastPage: 3,
          perPage: 5,
          next: 3,
          prev: 1,
        },
      };

      const customLinks = {
        first: 'http://localhost:3000/workouts?page=1&limit=5',
        last: 'http://localhost:3000/workouts?page=3&limit=5',
        current: 'http://localhost:3000/workouts?page=2&limit=5',
        next: 'http://localhost:3000/workouts?page=3&limit=5',
        previous: 'http://localhost:3000/workouts?page=1&limit=5',
      };

      jest.mock('@nodeteam/nestjs-prisma-pagination', () => ({
        paginator: jest
          .fn()
          .mockReturnValue(() => paginationResultWithoutLinks),
      }));

      mockDatabaseService.workout.findMany.mockResolvedValue(mockWorkoutData);
      mockDatabaseService.workout.count.mockResolvedValue(15);
      mockPaginationProvider.generatePaginationLinks.mockReturnValue(
        customLinks,
      );

      const customPaginationDto = { page: 2, limit: 5 };
      const customRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
        path: '/workouts',
        query: customPaginationDto,
      };

      const result = await service.findAll(
        userId,
        customPaginationDto,
        customRequest as any,
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result).toHaveProperty('links');

      expect(result.data).toEqual(mockWorkoutData);
      expect(result.meta).toEqual(paginationResultWithoutLinks.meta);
      expect(result.links).toEqual(customLinks);

      expect(
        mockPaginationProvider.generatePaginationLinks,
      ).toHaveBeenCalledWith(
        customRequest,
        paginationResultWithoutLinks.meta.lastPage,
        customPaginationDto.page,
        customPaginationDto.limit,
      );

      expect(result.links).toHaveProperty('first');
      expect(result.links).toHaveProperty('last');
      expect(result.links).toHaveProperty('current');
      expect(result.links).toHaveProperty('next');
      expect(result.links).toHaveProperty('previous');
    });
    it('should handle empty results correctly', async () => {
      const emptyData = [];

      const emptyPaginationResult = {
        data: emptyData,
        meta: {
          total: 0,
          currentPage: 1,
          lastPage: 0,
          perPage: 10,
          next: null,
          prev: null,
        },
      };

      const emptyLinks = {
        first: null,
        last: null,
        current: null,
        next: null,
        previous: null,
      };

      jest.mock('@nodeteam/nestjs-prisma-pagination', () => ({
        paginator: jest.fn().mockReturnValue(() => emptyPaginationResult),
      }));

      mockDatabaseService.workout.findMany.mockResolvedValue(emptyData);
      mockDatabaseService.workout.count.mockResolvedValue(0);
      mockPaginationProvider.generatePaginationLinks.mockReturnValue(
        emptyLinks,
      );

      const emptyRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
        path: '/workouts',
        query: paginationDto,
      };

      const result = await service.findAll(
        userId,
        paginationDto,
        emptyRequest as any,
      );

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result).toHaveProperty('links');

      expect(result.data).toEqual(emptyData);
      expect(result.data).toHaveLength(0);
      expect(result.meta).toEqual(emptyPaginationResult.meta);
      expect(result.links).toEqual(emptyLinks);

      expect(
        mockPaginationProvider.generatePaginationLinks,
      ).toHaveBeenCalledWith(
        emptyRequest,
        emptyPaginationResult.meta.lastPage,
        paginationDto.page,
        paginationDto.limit,
      );

      expect(result.links.first).toBeNull();
      expect(result.links.last).toBeNull();
      expect(result.links.current).toBeNull();
      expect(result.links.next).toBeNull();
      expect(result.links.previous).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a single workout when it exists', async () => {
      mockDatabaseService.workout.findUnique.mockResolvedValue(mockWorkoutData);

      const result = await service.findOne(mockWorkoutData.id);

      expect(result).toEqual(mockWorkoutData);
      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: mockWorkoutData.id },
        include: { exercises: true },
      });
    });

    it('should include related exercises in the returned workout', async () => {
      const mockWorkoutWithExercises = {
        ...mockWorkoutData,
        exercises: [
          {
            id: 'exercise-1',
            name: 'Bench Press',
            order: 1,
            type: 'Strength',
            notes: 'Focus on controlled movement',
            workoutId: mockWorkoutData.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      mockDatabaseService.workout.findUnique.mockResolvedValue(
        mockWorkoutWithExercises,
      );

      const result = await service.findOne(mockWorkoutData.id);

      expect(result.exercises).toBeDefined();
      expect(result.exercises).toHaveLength(1);
      expect(result.exercises).toEqual(mockWorkoutWithExercises.exercises);

      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: mockWorkoutData.id },
        include: { exercises: true },
      });
    });

    it('should call DatabaseService.workout.findUnique with the correct id', async () => {
      mockDatabaseService.workout.findUnique.mockResolvedValue(mockWorkoutData);

      await service.findOne(mockWorkoutId);

      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: mockWorkoutId },
        include: { exercises: true },
      });
    });

    it('should throw NotFoundException when the workout does not exist', async () => {
      const workoutId = 'not-existing-workout-id';

      const error = new NotFoundException('Workout not found');

      mockDatabaseService.workout.findUnique.mockResolvedValue(null);

      await expect(service.findOne(workoutId)).rejects.toThrow(error);
      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: workoutId },
        include: { exercises: true },
      });
    });

    it('should propagate an unexpected database error', async () => {
      mockDatabaseService.workout.findUnique.mockRejectedValue(databaseError);

      await expect(service.findOne(mockWorkoutId)).rejects.toThrow(
        databaseError,
      );

      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: mockWorkoutId },
        include: { exercises: true },
      });
    });
  });

  describe('create', () => {
    it('should successfully create a workout entity ', async () => {
      mockDatabaseService.workout.create.mockResolvedValue(mockWorkoutData);

      const result = await service.create(userId, mockWorkoutData);

      expect(result).toEqual(mockWorkoutData);
      expect(mockDatabaseService.workout.create).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.workout.create).toHaveBeenCalledWith({
        data: {
          ...mockWorkoutData,
          user: {
            connect: { id: userId },
          },
        },
      });
    });
    it('should propagate errors from the database creation process', async () => {
      mockDatabaseService.workout.create.mockRejectedValue(databaseError);

      await expect(
        service.create(userId, mockCreateWorkoutDto),
      ).rejects.toThrow(databaseError);

      expect(mockDatabaseService.workout.create).toHaveBeenCalledTimes(1);
    });
  });
  describe('update', () => {
    it('should update a workout when valid data is provided', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutData);

      const mockUpdatedWorkout = {
        ...mockWorkoutData,
        ...updateWorkoutDto,
      };

      mockDatabaseService.workout.update.mockResolvedValue(mockUpdatedWorkout);

      const result = await service.update(mockWorkoutData.id, updateWorkoutDto);

      expect(result).toEqual(mockUpdatedWorkout);
      expect(mockDatabaseService.workout.update).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.workout.update).toHaveBeenCalledWith({
        where: { id: mockWorkoutData.id },
        data: updateWorkoutDto,
      });
      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutData.id);
    });
    it('should throw NotFoundException when workout does not exist', async () => {
      const workoutId = 'wrong-workout-id';

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Workout not found'));

      await expect(service.update(workoutId, updateWorkoutDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.findOne).toHaveBeenCalledWith(workoutId);
      expect(mockDatabaseService.workout.update).not.toHaveBeenCalled();
    });
    it('should propagate errors thrown by databaseService.workout.update', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutData);
      mockDatabaseService.workout.update.mockRejectedValue(databaseError);

      await expect(
        service.update(mockWorkoutId, updateWorkoutDto),
      ).rejects.toThrow(databaseError);

      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutId);
      expect(mockDatabaseService.workout.update).toHaveBeenCalledWith({
        where: { id: mockWorkoutId },
        data: updateWorkoutDto,
      });
    });
  });
  describe('delete', () => {
    it('should delete the workout when it exists', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutData);

      mockDatabaseService.workout.delete.mockResolvedValue(mockWorkoutData);

      await service.delete(mockWorkoutData.id);

      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutData.id);
      expect(mockDatabaseService.workout.delete).toHaveBeenCalledWith({
        where: { id: mockWorkoutData.id },
      });
    });
    it('should throw NotFoundException when the workout does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Workout not found'));

      await expect(service.delete(mockWorkoutData.id)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutData.id);
      expect(mockDatabaseService.workout.update).not.toHaveBeenCalled();
    });
    it('should propagate errors thrown by databaseService.workout.delete', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutData);
      mockDatabaseService.workout.delete.mockRejectedValue(databaseError);

      await expect(service.delete(mockWorkoutId)).rejects.toThrow(
        databaseError,
      );

      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutId);
      expect(mockDatabaseService.workout.delete).toHaveBeenCalledWith({
        where: { id: mockWorkoutId },
      });
    });
  });

  describe('findAllExercise', () => {
    it('should return exercises for valid workout id', async () => {
      const mockExercises = [
        {
          id: 'exercise-1',
          name: 'Push-ups',
          order: 1,
          type: 'Bodyweight',
          notes: 'Test notes',
          workoutId: mockWorkoutId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutData);
      mockExercisesService.findAll.mockResolvedValue(mockExercises);

      const result = await service.findAllExercise(mockWorkoutId);

      expect(result).toEqual(mockExercises);
      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutId);
      expect(mockExercisesService.findAll).toHaveBeenCalledWith(mockWorkoutId);
    });

    it('should throw NotFoundException if workout does not exist', async () => {
      const mockWorkoutId = 'test-workout-id';

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Workout not found'));

      await expect(service.findAllExercise(mockWorkoutId)).rejects.toThrow(
        NotFoundException,
      );

      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutId);
      expect(mockExercisesService.findAll).not.toHaveBeenCalled();
    });
    it('should propagate error from exercisesService.findAll', async () => {
      const mockWorkoutId = 'test-workout-id';

      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutData);
      mockExercisesService.findAll.mockRejectedValue(exerciseError);

      await expect(service.findAllExercise(mockWorkoutId)).rejects.toThrow(
        exerciseError,
      );

      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutId);
      expect(mockExercisesService.findAll).toHaveBeenCalledWith(mockWorkoutId);
    });
  });
  describe('addExercise', () => {
    it('should successfully add exercise to workout', async () => {
      const mockWorkoutId = 'test-workout-id';

      const mockCreatedExercise = {
        id: 'exercise-1',
        workoutId: mockWorkoutId,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...mockCreateExerciseDto,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutData);
      mockExercisesService.create.mockResolvedValue(mockCreatedExercise);

      const result = await service.addExercise(
        mockWorkoutId,
        mockCreateExerciseDto,
      );

      expect(result).toEqual(mockCreatedExercise);
      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutId);
      expect(mockExercisesService.create).toHaveBeenCalledWith(
        mockWorkoutId,
        mockCreateExerciseDto,
      );
    });

    it('should throw NotFoundException when workout does not exist', async () => {
      const mockWorkoutId = 'test-workout-id';

      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Workout not found'));

      await expect(
        service.addExercise(mockWorkoutId, mockCreateExerciseDto),
      ).rejects.toThrow(NotFoundException);

      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutId);
      expect(mockExercisesService.create).not.toHaveBeenCalled();
    });

    it('should propagate error from exercisesService.create', async () => {
      const mockWorkoutId = 'test-workout-id';
      jest.spyOn(service, 'findOne').mockResolvedValue(mockWorkoutData);
      mockExercisesService.create.mockRejectedValue(exerciseError);

      await expect(
        service.addExercise(mockWorkoutId, mockCreateExerciseDto),
      ).rejects.toThrow(exerciseError);

      expect(service.findOne).toHaveBeenCalledWith(mockWorkoutId);
      expect(mockExercisesService.create).toHaveBeenCalledWith(
        mockWorkoutId,
        mockCreateExerciseDto,
      );
    });
  });
});
