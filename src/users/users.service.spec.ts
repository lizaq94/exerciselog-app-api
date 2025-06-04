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
});
