import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { LoggerService } from '../logger/logger.service';
import { SetsController } from './sets.controller';
import { SetsService } from './sets.service';

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    const mockSetId = '123';
    const mockSet = { id: mockSetId, reps: 10, weight: 100 };

    it('should return a set when valid ID is provided', async () => {
      mockSetsService.findOne.mockResolvedValue(mockSet);

      const result = await controller.findOne(mockSetId);

      expect(result).toEqual(mockSet);
      expect(mockSetsService.findOne).toHaveBeenCalledTimes(1);
      expect(mockSetsService.findOne).toHaveBeenCalledWith(mockSetId);
    });
    it('should throw NotFoundException when set does not exist', async () => {
      const mockSetId = 'wrong-id';
      mockSetsService.findOne.mockRejectedValue(
        new NotFoundException('Set not found'),
      );

      await expect(controller.findOne(mockSetId)).rejects.toThrowError(
        new NotFoundException('Set not found'),
      );
      expect(mockSetsService.findOne).toHaveBeenCalledWith(mockSetId);
    });
    it('should log information about fetching the set', async () => {
      mockSetsService.findOne.mockResolvedValue(mockSet);

      await controller.findOne(mockSetId);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Fetching set with ID: ${mockSetId}`,
        SetsController.name,
      );
    });
  });
});
