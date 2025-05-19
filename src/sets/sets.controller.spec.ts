import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Resource } from '../casl/types/resource.type';
import { LoggerService } from '../logger/logger.service';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';
import { testForbiddenException } from '../common/test/authorization-test.util';

const mockCaslAbilityFactory = {
  createForUser: jest.fn(),
};

const mockSetsService = {
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAllExercise: jest.fn(),
  addExercise: jest.fn(),
};

const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('SetsController', () => {
  let controller: SetsController;
  let setsService: SetsService;
  let loggerService: LoggerService;
  const mockSetId = '123';
  const mockSet = { id: mockSetId, reps: 10, weight: 100 };
  const mockUpdateDto = { reps: 12, weight: 110 };
  const mockUpdatedSet = {
    id: mockSetId,
    reps: 12,
    weight: 110,
    exerciseId: 'exercise-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SetsController],
      providers: [
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },
        { provide: SetsService, useValue: mockSetsService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    controller = module.get<SetsController>(SetsController);
    setsService = module.get<SetsService>(SetsService);
    loggerService = module.get<LoggerService>(LoggerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a set when valid ID is provided', async () => {
      mockSetsService.findOne.mockResolvedValue(mockSet);

      const result = await controller.findOne(mockSetId);

      expect(result).toEqual(mockSet);
      expect(mockSetsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockSetsService.findOne).toHaveBeenCalledWith(mockSetId);
    });

    it('should throw NotFoundException when set does not exist', async () => {
      const wrongId = 'wrong-id';
      mockSetsService.findOne.mockRejectedValue(
        new NotFoundException('Set not found'),
      );

      await expect(controller.findOne(wrongId)).rejects.toThrowError(
        new NotFoundException('Set not found'),
      );
      expect(mockSetsService.findOne).toHaveBeenCalledWith(wrongId);
    });

    it('should log information about fetching the set', async () => {
      mockSetsService.findOne.mockResolvedValue(mockSet);

      await controller.findOne(mockSetId);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Fetching set with ID: ${mockSetId}`,
        SetsController.name,
      );
    });

    it('should throw ForbiddenException when user tries to fetch set owned by another user', async () => {
      await testForbiddenException(
        controller.findOne.bind(controller),
        mockSetId,
        SetsService,
        mockSetsService,
        Resource.SET,
      );
    });
  });

  describe('update', () => {
    it('should successfully update set when valid data is provided', async () => {
      mockSetsService.update.mockResolvedValue(mockUpdatedSet);

      const result = await controller.update(mockSetId, mockUpdateDto);

      expect(result).toEqual(mockUpdatedSet);
      expect(mockSetsService.update).toHaveBeenCalledWith(
        mockSetId,
        mockUpdateDto,
      );
    });

    it('should throw NotFoundException when trying to update non-existing set', async () => {
      const nonExistingId = 'non-existing-id';
      mockSetsService.update.mockRejectedValue(
        new NotFoundException(`Set with ID ${nonExistingId} not found`),
      );

      await expect(
        controller.update(nonExistingId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log information about updating the set', async () => {
      mockSetsService.update.mockResolvedValue(mockUpdatedSet);

      await controller.update(mockSetId, mockUpdateDto);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Updating set with ID: ${mockSetId}`,
        SetsController.name,
      );
    });

    it('should throw ForbiddenException when user tries to update set owned by another user', async () => {
      await testForbiddenException(
        controller.update.bind(controller),
        mockSetId,
        SetsService,
        mockSetsService,
        Resource.SET,
        mockUpdateDto,
      );
    });
  });

  describe('delete', () => {
    it('should successfully delete set when valid ID is provided', async () => {
      mockSetsService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockSetId);

      expect(result).toBeUndefined();
      expect(mockSetsService.delete).toHaveBeenCalledWith(mockSetId);
    });

    it('should throw NotFoundException when trying to delete non-existing set', async () => {
      const nonExistingId = 'non-existing-id';
      mockSetsService.delete.mockRejectedValue(
        new NotFoundException('Set not found or has been deleted'),
      );

      await expect(controller.delete(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should log information about deleting the set', async () => {
      mockSetsService.delete.mockResolvedValue(undefined);

      await controller.delete(mockSetId);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        `Deleting set with ID: ${mockSetId}`,
        SetsController.name,
      );
    });

    it('should throw ForbiddenException when user tries to delete set owned by another user', async () => {
      await testForbiddenException(
        controller.delete.bind(controller),
        mockSetId,
        SetsService,
        mockSetsService,
        Resource.SET,
      );
    });
  });
});
