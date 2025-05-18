import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { CreateSetDto } from './dto/create-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { SetEntity } from './entities/set.entity';
import { SetsService } from './sets.service';

describe('SetsService', () => {
  let service: SetsService;

  const mockDatabaseService = {
    set: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockExerciseId = 'exercise-id';
  const mockSetId = 'set-id';

  const mockSetEntity: SetEntity = {
    id: 'set-id',
    repetitions: 10,
    weight: 50,
    order: 1,
    exerciseId: mockExerciseId,
    createdAt: new Date('2025-01-01T12:34:56.789Z'),
    updatedAt: new Date('2025-01-15T08:21:45.123Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<SetsService>(SetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all sets for given exerciseId', async () => {
      mockDatabaseService.set.findMany.mockResolvedValue([mockSetEntity]);

      const result = await service.findAll(mockExerciseId);

      expect(result).toEqual([mockSetEntity]);
      expect(result.length).toEqual(1);
      expect(mockDatabaseService.set.findMany).toHaveBeenCalledWith({
        where: { exerciseId: mockExerciseId },
      });
    });
    it('should return empty array when no sets exist for given exerciseId', async () => {
      const mockExerciseId = 'wrong-id';

      mockDatabaseService.set.findMany.mockResolvedValue([]);

      const result = await service.findAll(mockExerciseId);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
      expect(mockDatabaseService.set.findMany).toHaveBeenCalledWith({
        where: { exerciseId: mockExerciseId },
      });
    });
    it('should handle database errors properly', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseService.set.findMany.mockRejectedValue(dbError);

      await expect(service.findAll(mockExerciseId)).rejects.toThrow(dbError);
      expect(mockDatabaseService.set.findMany).toHaveBeenCalledWith({
        where: { exerciseId: mockExerciseId },
      });
    });
  });
  describe('create', () => {
    const mockCreateSetDto: CreateSetDto = {
      repetitions: 10,
      weight: 50,
      order: 1,
    };

    it('should create a new set with valid exerciseId and createSetDto', async () => {
      mockDatabaseService.set.create.mockResolvedValue({
        ...mockSetEntity,
        ...mockCreateSetDto,
      });

      const result = await service.create(mockExerciseId, mockCreateSetDto);

      expect(result).toBeDefined();
      expect(mockDatabaseService.set.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateSetDto,
          exercise: {
            connect: { id: mockExerciseId },
          },
        },
      });
      expect(result).toEqual({
        ...mockSetEntity,
        ...mockCreateSetDto,
      });
    });
    it('should handle database errors properly', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseService.set.create.mockRejectedValue(dbError);

      await expect(
        service.create(mockExerciseId, mockCreateSetDto),
      ).rejects.toThrow(dbError);
      expect(mockDatabaseService.set.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateSetDto,
          exercise: {
            connect: { id: mockExerciseId },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a set when valid id is provided', async () => {
      mockDatabaseService.set.findUnique.mockResolvedValue(mockSetEntity);

      const result = await service.findOne(mockSetId);

      expect(result).toEqual(mockSetEntity);
    });

    it('should throw NotFoundException when set with given id does not exist', async () => {
      mockDatabaseService.set.findUnique.mockResolvedValue(null);

      await expect(service.findOne(mockSetId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockDatabaseService.set.findUnique).toHaveBeenCalledWith({
        where: { id: mockSetId },
      });
    });

    it('should handle database errors properly', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseService.set.findUnique.mockRejectedValue(dbError);

      await expect(service.findOne(mockSetId)).rejects.toThrow(dbError);
      expect(mockDatabaseService.set.findUnique).toHaveBeenCalledWith({
        where: { id: mockSetId },
      });
    });
  });

  describe('update', () => {
    const mockUpdateSetDto: UpdateSetDto = {
      repetitions: 12,
      weight: 60,
      order: 2,
    };

    it('should successfully update a set when valid id and data are provided', async () => {
      mockDatabaseService.set.findUnique.mockResolvedValue(mockSetEntity);

      mockDatabaseService.set.update.mockResolvedValue({
        ...mockSetEntity,
        ...mockUpdateSetDto,
      });

      const result = await service.update(mockSetId, mockUpdateSetDto);

      expect(result).toEqual({
        ...mockSetEntity,
        ...mockUpdateSetDto,
      });
      expect(mockDatabaseService.set.findUnique).toHaveBeenCalledWith({
        where: { id: mockSetId },
      });
      expect(mockDatabaseService.set.update).toHaveBeenCalledWith({
        where: { id: mockSetId },
        data: mockUpdateSetDto,
      });
    });

    it('should throw NotFoundException when set with given id does not exist', async () => {
      mockDatabaseService.set.findUnique.mockResolvedValue(null);

      await expect(service.update(mockSetId, mockUpdateSetDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockDatabaseService.set.findUnique).toHaveBeenCalledWith({
        where: { id: mockSetId },
      });
    });

    it('should handle database errors properly', async () => {
      const dbError = new Error('Database connection failed');
      mockDatabaseService.set.findUnique.mockResolvedValue(mockSetEntity);
      mockDatabaseService.set.update.mockRejectedValue(dbError);

      await expect(service.update(mockSetId, mockUpdateSetDto)).rejects.toThrow(
        dbError,
      );

      expect(mockDatabaseService.set.findUnique).toHaveBeenCalledWith({
        where: { id: mockSetId },
      });

      expect(mockDatabaseService.set.update).toHaveBeenCalledWith({
        where: { id: mockSetId },
        data: mockUpdateSetDto,
      });
    });
  });
  describe('delete', () => {
    it('should successfully delete a set when it exists', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockSetEntity);

      await service.delete(mockSetId);

      expect(service.findOne).toHaveBeenCalledWith(mockSetId);
      expect(mockDatabaseService.set.delete).toHaveBeenCalledWith({
        where: { id: mockSetId },
      });
      expect(mockDatabaseService.set.delete).toHaveBeenCalled();
    });
    it('should throw NotFoundException when set does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException('Set not found'));

      await expect(service.delete(mockSetId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete(mockSetId)).rejects.toThrow('Set not found');

      expect(service.findOne).toHaveBeenCalledWith(mockSetId);
    });
    it('should handle database errors properly during delete operation', async () => {
      const dbError = new Error('Database connection failed');

      mockDatabaseService.set.findUnique.mockResolvedValue(mockSetEntity);
      mockDatabaseService.set.delete.mockRejectedValue(dbError);

      await expect(service.delete(mockSetId)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockDatabaseService.set.findUnique).toHaveBeenCalledWith({
        where: { id: mockSetId },
      });
      expect(mockDatabaseService.set.delete).toHaveBeenCalledWith({
        where: { id: mockSetId },
      });
    });
  });
});
