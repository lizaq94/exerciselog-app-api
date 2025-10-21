import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { HashingProvider } from '../auth/providers/hashing.provider';
import { WorkoutsService } from '../workouts/workouts.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;

  const mockDatabaseService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    workout: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockWorkoutsService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockHashingProvider = {
    encrypt: jest.fn(),
    compareValueWithHash: jest.fn(),
  };

  const mockEmail = 'test@example.com';
  const mockUserId = 'user-id';
  const mockUser = {
    id: mockUserId,
    email: mockEmail,
    name: 'Test User',
    workouts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: WorkoutsService, useValue: mockWorkoutsService },
        { provide: HashingProvider, useValue: mockHashingProvider },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a user when valid email is provided', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(mockEmail);

      expect(result).toEqual(mockUser);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
        include: { workouts: true },
      });
    });

    it('should return null when user does not exist and throwError is false', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOne(mockEmail, false);

      expect(result).toEqual(null);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
        include: { workouts: true },
      });
    });

    it('should throw NotFoundException when user does not exist and throwError is true', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockEmail)).rejects.toThrow(
        'User not found',
      );
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
        include: { workouts: true },
      });
    });

    it('should handle database errors properly', async () => {
      const dbError = new Error('Database connection failed');

      mockDatabaseService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.findOne(mockEmail)).rejects.toThrow(dbError);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockEmail },
        include: { workouts: true },
      });
    });
  });

  describe('findOneById', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a user with full workout data when valid id is provided', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneById(mockUserId);

      expect(result).toEqual(mockUser);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: {
          workouts: { include: { exercises: { include: { sets: true } } } },
        },
      });
    });

    it('should throw NotFoundException when user with given id does not exist', async () => {
      const wrongUserId = 'wrong-user-id';
      const error = new NotFoundException('User not found');

      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOneById(wrongUserId)).rejects.toThrow(error);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: wrongUserId },
        include: {
          workouts: { include: { exercises: { include: { sets: true } } } },
        },
      });
    });

    it('should handle database errors properly', async () => {
      const dbError = new Error('Database connection failed');

      mockDatabaseService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.findOneById(mockUserId)).rejects.toThrow(dbError);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: {
          workouts: { include: { exercises: { include: { sets: true } } } },
        },
      });
    });
  });

  describe('create', () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      username: 'New User',
      password: 'plainPassword',
    };

    const mockHashedPassword = 'hashedPassword123';
    const mockCreatedUser = {
      id: 'new-user-id',
      ...mockCreateUserDto,
      password: mockHashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expectedResult = {
      id: 'new-user-id',
      email: 'newuser@example.com',
      username: 'New User',
      createdAt: mockCreatedUser.createdAt,
      updatedAt: mockCreatedUser.updatedAt,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a new user with encrypted password', async () => {
      mockHashingProvider.encrypt.mockResolvedValue(mockHashedPassword);
      mockDatabaseService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await service.create(mockCreateUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result).toMatchObject(expectedResult);
      expect(mockHashingProvider.encrypt).toHaveBeenCalledWith(
        mockCreateUserDto.password,
      );
      expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateUserDto,
          password: mockHashedPassword,
        },
      });
    });

    it('should handle password encryption errors properly', async () => {
      const encryptionError = new Error('Encryption failed');
      mockHashingProvider.encrypt.mockRejectedValue(encryptionError);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        encryptionError,
      );
      expect(mockHashingProvider.encrypt).toHaveBeenCalledWith(
        mockCreateUserDto.password,
      );
      expect(mockDatabaseService.user.create).not.toHaveBeenCalled();
    });

    it('should handle database creation errors properly', async () => {
      const dbError = new Error('Database creation failed');

      mockHashingProvider.encrypt.mockResolvedValue(mockHashedPassword);
      mockDatabaseService.user.create.mockRejectedValue(dbError);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(dbError);
      expect(mockHashingProvider.encrypt).toHaveBeenCalledWith(
        mockCreateUserDto.password,
      );
      expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateUserDto,
          password: mockHashedPassword,
        },
      });
    });
  });
  describe('update', () => {
    const mockUpdateUserDto = {
      username: 'Updated User',
      email: 'updated@example.com',
    };

    const mockUpdateUserDtoWithPassword = {
      username: 'Updated User',
      password: 'newPassword',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully update user when valid id and data are provided', async () => {
      const mockExistingUser = {
        id: mockUserId,
        email: 'old@example.com',
        username: 'Old User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        id: mockUserId,
        email: 'updated@example.com',
        username: 'Updated User',
        createdAt: mockExistingUser.createdAt,
        updatedAt: new Date(),
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockDatabaseService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update(mockUserId, mockUpdateUserDto);

      expect(result).toBeInstanceOf(UserEntity);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: mockUpdateUserDto,
      });
      expect(mockHashingProvider.encrypt).not.toHaveBeenCalled();
    });

    it('should update user with encrypted password when password is provided', async () => {
      const mockNewHashedPassword = 'newHashedPassword';

      const mockUpdateUserDtoWithNewHashedPassword = {
        username: 'Updated User',
        password: mockNewHashedPassword,
      };

      const mockExistingUser = {
        id: mockUserId,
        email: 'old@example.com',
        username: 'Old User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        id: mockUserId,
        email: 'updated@example.com',
        username: 'Updated User',
        createdAt: mockExistingUser.createdAt,
        updatedAt: new Date(),
      };

      mockDatabaseService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockHashingProvider.encrypt.mockResolvedValue(mockNewHashedPassword);

      mockDatabaseService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.update(
        mockUserId,
        mockUpdateUserDtoWithPassword,
      );

      expect(result).toBeInstanceOf(UserEntity);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockHashingProvider.encrypt).toHaveBeenCalledWith(
        mockUpdateUserDtoWithPassword.password,
      );
      expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: mockUpdateUserDtoWithNewHashedPassword,
      });
    });

    it('should throw NotFoundException when user with given id does not exist', async () => {
      const wrongUserId = 'wrong-user-id';

      const error = new NotFoundException('User not found');

      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update(wrongUserId, mockUpdateUserDto),
      ).rejects.toThrow(error);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: wrongUserId },
        select: { id: true },
      });
    });

    it('should handle password encryption errors properly', async () => {
      const mockExistingUser = {
        id: mockUserId,
      };

      const encryptionError = new Error('Encryption failed');

      mockDatabaseService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockHashingProvider.encrypt.mockRejectedValue(encryptionError);

      await expect(
        service.update(mockUserId, mockUpdateUserDtoWithPassword),
      ).rejects.toThrow(encryptionError);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockHashingProvider.encrypt).toHaveBeenCalledWith(
        mockUpdateUserDtoWithPassword.password,
      );
      expect(mockDatabaseService.user.update).not.toHaveBeenCalled();
    });

    it('should handle database update errors properly', async () => {
      const mockExistingUser = {
        id: mockUserId,
      };

      const dbError = new Error('Database update failed');

      mockDatabaseService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockDatabaseService.user.update.mockRejectedValue(dbError);

      await expect(
        service.update(mockUserId, mockUpdateUserDto),
      ).rejects.toThrow(dbError);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockDatabaseService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: mockUpdateUserDto,
      });
      expect(mockHashingProvider.encrypt).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully delete user when it exists', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue({ id: mockUserId });
      mockDatabaseService.user.delete.mockResolvedValue(undefined);

      await service.delete(mockUserId);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockDatabaseService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.delete(mockUserId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockDatabaseService.user.delete).not.toHaveBeenCalled();
    });

    it('should handle database deletion errors properly', async () => {
      const mockExistingUser = { id: mockUserId };

      const dbError = new Error('Database update failed');

      mockDatabaseService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockDatabaseService.user.delete.mockRejectedValue(dbError);

      await expect(service.delete(mockUserId)).rejects.toThrow(dbError);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockDatabaseService.user.delete).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
    });
  });

  describe('findAllWorkouts', () => {
    const mockPagination = { page: 1, limit: 10 };
    const mockRequest = {} as Request;
    const mockWorkouts = [
      { id: 'workout-1', name: 'Workout 1' },
      { id: 'workout-2', name: 'Workout 2' },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return user workouts when user exists', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockWorkoutsService.findAll.mockResolvedValue(mockWorkouts);

      const result = await service.findAllWorkouts(
        mockUserId,
        mockPagination,
        mockRequest as any,
      );

      expect(result).toEqual(mockWorkouts);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockWorkoutsService.findAll).toHaveBeenCalledWith(
        mockUserId,
        mockPagination,
        mockRequest,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.findAllWorkouts(mockUserId, mockPagination, mockRequest as any),
      ).rejects.toThrow(NotFoundException);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockDatabaseService.workout.findMany).not.toHaveBeenCalled();
    });

    it('should handle database errors when checking user existence', async () => {
      const databaseError = new Error('Database connection failed');
      mockDatabaseService.user.findUnique.mockRejectedValue(databaseError);

      await expect(
        service.findAllWorkouts(mockUserId, mockPagination, mockRequest as any),
      ).rejects.toThrow('Database connection failed');

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockWorkoutsService.findAll).not.toHaveBeenCalled();
    });

    it('should handle workoutService errors properly', async () => {
      const databaseError = new Error('Database connection failed');
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockWorkoutsService.findAll.mockRejectedValue(databaseError);

      await expect(
        service.findAllWorkouts(mockUserId, mockPagination, mockRequest as any),
      ).rejects.toThrow('Database connection failed');

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockWorkoutsService.findAll).toHaveBeenCalled();
    });
  });

  describe('addWorkout', () => {
    const mockCreateWorkoutDto = {
      name: 'New Workout',
      description: 'Test workout',
      notes: 'Test notes',
      duration: 60,
    };
    const mockCreatedWorkout = {
      id: 'new-workout-id',
      ...mockCreateWorkoutDto,
      userId: mockUserId,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully add workout when user exists', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue({ id: mockUserId });
      mockWorkoutsService.create.mockResolvedValue(mockCreatedWorkout);

      const result = await service.addWorkout(mockUserId, mockCreateWorkoutDto);

      expect(result).toEqual(mockCreatedWorkout);
      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockWorkoutsService.create).toHaveBeenCalledWith(
        mockUserId,
        mockCreateWorkoutDto,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      await expect(
        service.addWorkout(mockUserId, mockCreateWorkoutDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockDatabaseService.workout.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when checking user existence', async () => {
      const databaseError = new Error('Database connection failed');
      mockDatabaseService.user.findUnique.mockRejectedValue(databaseError);

      await expect(
        service.addWorkout(mockUserId, mockCreateWorkoutDto),
      ).rejects.toThrow('Database connection failed');

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockWorkoutsService.create).not.toHaveBeenCalled();
    });

    it('should handle workoutService creation errors properly', async () => {
      const databaseError = new Error('Database connection failed');
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUser);
      mockWorkoutsService.create.mockRejectedValue(databaseError);

      await expect(
        service.addWorkout(mockUserId, mockCreateWorkoutDto),
      ).rejects.toThrow('Database connection failed');

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockWorkoutsService.create).toHaveBeenCalled();
    });
  });

  describe('addWorkoutBulk', () => {
    const mockCreateWorkoutBulkDto = {
      name: 'Push Day - Upper Body',
      notes: 'Focus on chest and triceps',
      duration: 60,
      exercises: [
        {
          order: 1,
          name: 'Bench Press',
          type: 'main',
          notes: 'Keep back flat',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 60,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
            {
              order: 2,
              repetitions: 8,
              weight: 70,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
          ],
        },
        {
          order: 2,
          name: 'Dumbbell Press',
          type: 'main',
          notes: 'Control the movement',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 20,
              durationInSeconds: 0,
              restAfterSetInSeconds: 60,
            },
          ],
        },
      ],
    };

    const mockCreatedWorkout = {
      id: 'workout-123',
      name: 'Push Day - Upper Body',
      notes: 'Focus on chest and triceps',
      duration: 60,
      date: new Date(),
      userId: mockUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCreatedExercise1 = {
      id: 'exercise-1',
      name: 'Bench Press',
      order: 1,
      type: 'main',
      notes: 'Keep back flat',
      workoutId: 'workout-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCreatedExercise2 = {
      id: 'exercise-2',
      name: 'Dumbbell Press',
      order: 2,
      type: 'main',
      notes: 'Control the movement',
      workoutId: 'workout-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockWorkoutWithRelations = {
      ...mockCreatedWorkout,
      exercises: [
        {
          ...mockCreatedExercise1,
          sets: [
            {
              id: 'set-1',
              order: 1,
              repetitions: 10,
              weight: 60,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
              exerciseId: 'exercise-1',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'set-2',
              order: 2,
              repetitions: 8,
              weight: 70,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
              exerciseId: 'exercise-1',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
        {
          ...mockCreatedExercise2,
          sets: [
            {
              id: 'set-3',
              order: 1,
              repetitions: 10,
              weight: 20,
              durationInSeconds: 0,
              restAfterSetInSeconds: 60,
              exerciseId: 'exercise-2',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ],
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully create workout with exercises and sets', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue({ id: mockUserId });

      let exerciseCreateCallCount = 0;
      let setCreateCallCount = 0;

      const mockTransaction = jest.fn(async (callback) => {
        const mockTx = {
          workout: {
            create: jest.fn().mockResolvedValue(mockCreatedWorkout),
            findUnique: jest.fn().mockResolvedValue(mockWorkoutWithRelations),
          },
          exercise: {
            create: jest.fn().mockImplementation(() => {
              exerciseCreateCallCount++;
              return exerciseCreateCallCount === 1
                ? mockCreatedExercise1
                : mockCreatedExercise2;
            }),
          },
          set: {
            create: jest.fn().mockImplementation(() => {
              setCreateCallCount++;
              return { id: `set-${setCreateCallCount}` };
            }),
          },
        };
        return callback(mockTx);
      });

      mockDatabaseService.$transaction = mockTransaction;

      const result = await service.addWorkoutBulk(
        mockUserId,
        mockCreateWorkoutBulkDto,
      );

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });

      expect(mockTransaction).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockWorkoutWithRelations);
      expect(result.exercises).toHaveLength(2);
      expect(result.exercises[0].sets).toHaveLength(2);
      expect(result.exercises[1].sets).toHaveLength(1);

      expect(result.exercises[0].name).toBe('Bench Press');
      expect(result.exercises[0].order).toBe(1);
      expect(result.exercises[1].name).toBe('Dumbbell Press');
      expect(result.exercises[1].order).toBe(2);

      expect(result.exercises[0].sets[0].repetitions).toBe(10);
      expect(result.exercises[0].sets[0].weight).toBe(60);
      expect(result.exercises[0].sets[1].repetitions).toBe(8);
      expect(result.exercises[0].sets[1].weight).toBe(70);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addWorkoutBulk(mockUserId, mockCreateWorkoutBulkDto),
      ).rejects.toThrow(NotFoundException);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockDatabaseService.$transaction).not.toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue({ id: mockUserId });

      const transactionError = new Error('Failed to create exercise');
      const mockTransaction = jest.fn(async (callback) => {
        const mockTx = {
          workout: {
            create: jest.fn().mockResolvedValue(mockCreatedWorkout),
            findUnique: jest.fn(),
          },
          exercise: {
            create: jest.fn().mockRejectedValue(transactionError),
          },
          set: {
            create: jest.fn(),
          },
        };
        return callback(mockTx);
      });

      mockDatabaseService.$transaction = mockTransaction;

      await expect(
        service.addWorkoutBulk(mockUserId, mockCreateWorkoutBulkDto),
      ).rejects.toThrow(transactionError);

      expect(mockDatabaseService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true },
      });
      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });
  });
});
