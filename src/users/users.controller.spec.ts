import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../logger/logger.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { WorkoutsService } from '../workouts/workouts.service';
import { Resource } from '../casl/types/resource.type';
import { testForbiddenException } from '../common/test/authorization-test.util';
import { GetWorkoutsDto } from '../workouts/dtos/get-workouts.dto';

const mockUserId = 'user-id';

const mockUser = {
  id: mockUserId,
  username: 'testuser',
  email: 'test@example.com',
};

const mockUsersService = {
  findOneById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAllWorkouts: jest.fn(),
  addWorkout: jest.fn(),
};

const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

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

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },
        { provide: WorkoutsService, useValue: mockWorkoutsService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a user when valid ID is provided', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUserId);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersService.findOneById.mockRejectedValue(
        new NotFoundException(`User not found`),
      );

      await expect(controller.findOne(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should log information about fetching the user', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);

      await controller.findOne(mockUserId);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Fetching user with ID: ${mockUserId}`,
        UsersController.name,
      );
    });

    it('should throw UnauthorizedException when JWT token is invalid', async () => {
      const error = new UnauthorizedException('Unauthorized');
      mockUsersService.findOneById.mockRejectedValue(error);

      await expect(controller.findOne(mockUserId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('create', () => {
    const mockCreateUserDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
    };

    const mockCreatedUser = {
      id: 'new-user-id',
      username: 'newuser',
      email: 'newuser@example.com',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a new user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(mockCreateUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should log a message when a new user is created', async () => {
      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      await controller.create(mockCreateUserDto);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Adding new user',
        UsersController.name,
      );
    });

    it('should throw an exception when the user creation fails', async () => {
      const error = new Error('Failed to create user');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    const mockUpdateUserDto: UpdateUserDto = {
      username: 'new-user-name',
    };

    const mockUpdatedUser = {
      ...mockUser,
      ...mockUpdateUserDto,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully update the user when valid update data is provided', async () => {
      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update(mockUserId, mockUpdateUserDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUserId,
        mockUpdateUserDto,
      );
    });

    it('should log update action with the correct user ID', async () => {
      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      await controller.update(mockUserId, mockUpdateUserDto);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Updating user with ID: ${mockUserId}`,
        UsersController.name,
      );
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.update(mockUserId, mockUpdateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when JWT token is invalid', async () => {
      const error = new UnauthorizedException('Unauthorized');
      mockUsersService.update.mockRejectedValue(error);

      await expect(
        controller.update(mockUserId, mockUpdateUserDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate the error when the service fails during update', async () => {
      const error = new Error('Internal server error');
      mockUsersService.update.mockRejectedValue(error);

      await expect(
        controller.update(mockUserId, mockUpdateUserDto),
      ).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should successfully delete user when valid ID is provided', async () => {
      mockUsersService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockUserId);

      expect(result).toBeUndefined();
      expect(mockUsersService.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw NotFoundException when trying to delete non-existing user', async () => {
      mockUsersService.delete.mockRejectedValue(
        new NotFoundException('User not found or has been deleted'),
      );

      await expect(controller.delete(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('should propagate the error when the service fails during delete', async () => {
      const error = new Error('Internal server error');
      mockUsersService.delete.mockRejectedValue(error);

      await expect(controller.delete(mockUserId)).rejects.toThrow(error);
      expect(mockUsersService.delete).toHaveBeenCalledWith(mockUserId);
    });

    it('should call logger.error with the correct message when delete is invoked', async () => {
      mockUsersService.delete.mockResolvedValue(undefined);

      await controller.delete(mockUserId);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        `Deleting user with ID: ${mockUserId}`,
        UsersController.name,
      );
    });
  });

  describe('findAllWorkouts', () => {
    const mockUserId = 'user-123';
    const mockWorkoutsQuery = { page: 1, limit: 10 };
    const mockRequest = {
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    } as any;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return all workouts for a specific user', async () => {
      const mockWorkouts = {
        data: [
          {
            id: 'workout-1',
            name: 'Morning Workout',
            date: new Date('2025-05-01T08:00:00.000Z'),
            duration: 60,
            notes: 'Leg day',
            userId: mockUserId,
            createdAt: new Date('2025-05-01T08:00:00.000Z'),
            updatedAt: new Date('2025-05-01T08:00:00.000Z'),
            exercises: [],
          },
          {
            id: 'workout-2',
            name: 'Evening Workout',
            date: new Date('2025-05-01T18:00:00.000Z'),
            duration: 45,
            notes: 'Upper body focus',
            userId: mockUserId,
            createdAt: new Date('2025-05-01T18:00:00.000Z'),
            updatedAt: new Date('2025-05-01T18:00:00.000Z'),
            exercises: [],
          },
        ],
        meta: {
          totalItems: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
        links: {
          first: 'http://localhost/users/user-123/workouts?page=1&limit=10',
          previous: '',
          next: '',
          last: 'http://localhost/users/user-123/workouts?page=1&limit=10',
        },
      };

      mockUsersService.findAllWorkouts.mockResolvedValue(mockWorkouts);

      const result = await controller.findAllWorkouts(
        mockUserId,
        mockWorkoutsQuery,
        mockRequest,
      );

      expect(result).toEqual(mockWorkouts);
      expect(mockUsersService.findAllWorkouts).toHaveBeenCalledWith(
        mockUserId,
        mockWorkoutsQuery,
        mockRequest,
      );
      expect(mockUsersService.findAllWorkouts).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no workouts', async () => {
      const mockEmptyResponse = {
        data: [],
        meta: {
          totalItems: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
        links: {
          first: 'http://localhost/users/user-123/workouts?page=1&limit=10',
          previous: '',
          next: '',
          last: 'http://localhost/users/user-123/workouts?page=1&limit=10',
        },
      };

      mockUsersService.findAllWorkouts.mockResolvedValue(mockEmptyResponse);

      const result = await controller.findAllWorkouts(
        mockUserId,
        mockWorkoutsQuery,
        mockRequest,
      );

      expect(result).toEqual(mockEmptyResponse);
      expect(result.data).toEqual([]);
      expect(result.data.length).toBe(0);
      expect(mockUsersService.findAllWorkouts).toHaveBeenCalledWith(
        mockUserId,
        mockWorkoutsQuery,
        mockRequest,
      );
      expect(mockUsersService.findAllWorkouts).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersService.findAllWorkouts.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.findAllWorkouts(mockUserId, mockWorkoutsQuery, mockRequest),
      ).rejects.toThrow(NotFoundException);

      expect(mockUsersService.findAllWorkouts).toHaveBeenCalledWith(
        mockUserId,
        mockWorkoutsQuery,
        mockRequest,
      );
      expect(mockUsersService.findAllWorkouts).toHaveBeenCalledTimes(1);
    });

    it('should log information about retrieving workouts', async () => {
      mockUsersService.findAllWorkouts.mockResolvedValue(undefined);

      await controller.findAllWorkouts(
        mockUserId,
        mockWorkoutsQuery,
        mockRequest,
      );

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Retrieving workouts for user ID: ${mockUserId}`,
        UsersController.name,
      );
    });

    it('should throw ForbiddenException when user tries to fetch workouts of another user', async () => {
      const anotherUserId = 'different-user-456';

      await testForbiddenException(
        controller.findAllWorkouts.bind(controller),
        anotherUserId,
        UsersService,
        mockUsersService,
        Resource.USER,
      );
    });

    it('should apply query filters correctly', async () => {
      const mockUserId = 'user-123';
      const mockWorkoutsQuery: GetWorkoutsDto = {
        page: 2,
        limit: 5,
      };
      const mockRequest = {
        protocol: 'https',
        get: jest.fn().mockReturnValue('api.example.com'),
        user: { id: mockUserId },
      } as any;

      const expectedResponse = {
        data: [
          {
            id: 'workout-1',
            name: 'Morning Strength',
            date: '2023-10-15T08:00:00.000Z',
            userId: mockUserId,
          },
          {
            id: 'workout-2',
            name: 'Evening Cardio',
            date: '2023-10-14T19:30:00.000Z',
            userId: mockUserId,
          },
        ],
        meta: {
          total: 15,
          page: 2,
          limit: 5,
          totalPages: 3,
        },
        links: {
          first:
            'https://api.example.com/users/user-123/workouts?page=1&limit=5',
          last: 'https://api.example.com/users/user-123/workouts?page=3&limit=5',
          prev: 'https://api.example.com/users/user-123/workouts?page=1&limit=5',
          next: 'https://api.example.com/users/user-123/workouts?page=3&limit=5',
        },
      };

      mockUsersService.findAllWorkouts.mockResolvedValue(expectedResponse);

      const result = await controller.findAllWorkouts(
        mockUserId,
        mockWorkoutsQuery,
        mockRequest,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockUsersService.findAllWorkouts).toHaveBeenCalledWith(
        mockUserId,
        mockWorkoutsQuery,
        mockRequest,
      );
      expect(mockUsersService.findAllWorkouts).toHaveBeenCalledTimes(1);

      // Verify that pagination parameters were passed correctly
      const [userId, query, request] =
        mockUsersService.findAllWorkouts.mock.calls[0];
      expect(userId).toBe(mockUserId);
      expect(query).toMatchObject({
        page: 2,
        limit: 5,
      });
      expect(request).toBe(mockRequest);
    });
  });
});
