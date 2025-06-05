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
});
