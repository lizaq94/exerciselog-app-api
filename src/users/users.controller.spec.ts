import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../logger/logger.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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
    const mockUserId = 'user-id';
    const mockUser = { id: mockUserId, username: 'testuser' };

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
        'UsersController',
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
});
