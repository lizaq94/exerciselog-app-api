import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../logger/logger.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
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

    it('should throw ForbiddenException when user tries to fetch user owned by another user', async () => {
      mockUsersService.findOneById.mockRejectedValue(
        new ForbiddenException('No permission to access this user'),
      );

      await expect(controller.findOne(mockUserId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockUsersService.findOneById).toHaveBeenCalledWith(mockUserId);
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
});
