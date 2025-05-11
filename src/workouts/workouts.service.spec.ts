import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutsService } from './workouts.service';
import { DatabaseService } from '../database/database.service';
import { ExercisesService } from '../exercises/exercises.service';
import { PaginationProvider } from '../common/pagination/pagination.provider';
import { NotFoundException } from '@nestjs/common';

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
  };

  const mockExercisesService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockPaginationProvider = {
    generatePaginationLinks: jest.fn(),
  };

  const userId = 'test-user-id';

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
      query: paginationDto,
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
      const workoutId = 'test-workout-id';
      mockDatabaseService.workout.findUnique.mockResolvedValue(mockWorkoutData);

      await service.findOne(workoutId);

      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: workoutId },
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
      const workoutId = 'test-workout-id';
      const databaseError = new Error('Database connection error');
      mockDatabaseService.workout.findUnique.mockRejectedValue(databaseError);

      await expect(service.findOne(workoutId)).rejects.toThrow(databaseError);

      expect(mockDatabaseService.workout.findUnique).toHaveBeenCalledWith({
        where: { id: workoutId },
        include: { exercises: true },
      });
    });
  });
});
