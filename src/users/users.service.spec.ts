import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { HashingProvider } from '../auth/providers/hashing.provider';
import { WorkoutsService } from '../workouts/workouts.service';

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
    const mockEmail = 'test@example.com';
    const mockUser = {
      id: 'user-id',
      email: mockEmail,
      name: 'Test User',
      workouts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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
});
