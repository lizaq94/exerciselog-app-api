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
});
