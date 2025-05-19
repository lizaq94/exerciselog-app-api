import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { Resource } from '../casl/types/resource.type';
import { testForbiddenException } from '../common/test/authorization-test.util';
import { LoggerService } from '../logger/logger.service';
import { SetsService } from '../sets/sets.service';
import { UploadsService } from '../uploads/providers/uploads.service';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseEntity } from './entities/exercise.entity';

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

const mockExercisesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUploadsService = {};

const mockExerciseId = 'exercise-id';

const mockExercise: ExerciseEntity = {
  id: mockExerciseId,
  name: 'Bench Press',
  order: 1,
  type: 'Strength',
  notes: 'Focus on controlled movement',
  sets: [],
  workoutId: '29c18142-ce1d-41a5-9920-a376fe28f16f',
  createdAt: new Date('2024-01-01T12:00:00.000Z'),
  updatedAt: new Date('2024-01-01T12:00:00.000Z'),
};

const mockUpdateDto: UpdateExerciseDto = {
  name: 'Updated Bench Press',
  order: 2,
  type: 'Hypertrophy',
  notes: 'Updated notes',
};

const mockUpdatedExercise: ExerciseEntity = {
  ...mockExercise,
  ...mockUpdateDto,
};

describe('ExerciseController', () => {
  let controller: ExercisesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        { provide: ExercisesService, useValue: mockExercisesService },
        { provide: CaslAbilityFactory, useValue: mockCaslAbilityFactory },
        { provide: SetsService, useValue: mockSetsService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: UploadsService, useValue: mockUploadsService },
      ],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a exercise when valid ID is provided', async () => {
      mockExercisesService.findOne.mockResolvedValue(mockExercise);
      const result = await controller.findOne(mockExerciseId);

      expect(result).toEqual(mockExercise);
      expect(mockExercisesService.findOne).toHaveBeenCalledTimes(1);
      expect(mockExercisesService.findOne).toHaveBeenCalledWith(mockExerciseId);
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      const mockExerciseId = 'wrong-id';
      mockExercisesService.findOne.mockRejectedValue(
        new NotFoundException('Exercise not found'),
      );

      await expect(controller.findOne(mockExerciseId)).rejects.toThrowError(
        new NotFoundException('Exercise not found'),
      );
      expect(mockExercisesService.findOne).toHaveBeenCalledWith(mockExerciseId);
    });

    it('should log information about fetching the exercise', async () => {
      mockExercisesService.findOne.mockResolvedValue(mockExercise);

      await controller.findOne(mockExerciseId);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Fetching exercise with ID: ${mockExerciseId}`,
        ExercisesController.name,
      );
    });

    it('should throw ForbiddenException when user tries to fetch exercise owned by another user', async () => {
      await testForbiddenException(
        controller.findOne.bind(controller),
        mockExerciseId,
        ExercisesService,
        mockExercisesService,
        Resource.EXERCISE,
      );
    });
  });

  describe('update', () => {
    it('should update exercise when valid data is provided', async () => {
      mockExercisesService.update.mockResolvedValue(mockUpdatedExercise);

      const result = await controller.update(mockExerciseId, mockUpdateDto);

      expect(result).toEqual(mockUpdatedExercise);
      expect(mockExercisesService.update).toHaveBeenCalledWith(
        mockExerciseId,
        mockUpdateDto,
      );
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      const mockExerciseId = 'wrong-id';

      mockExercisesService.update.mockRejectedValue(
        new NotFoundException('Exercise not found'),
      );

      await expect(
        controller.update(mockExerciseId, mockUpdateDto),
      ).rejects.toThrowError(new NotFoundException('Exercise not found'));
    });

    it('should log information about updating the exercise', async () => {
      mockExercisesService.update.mockResolvedValue(mockUpdatedExercise);

      await controller.update(mockExerciseId, mockUpdateDto);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Updating exercise with ID: ${mockExerciseId}`,
        ExercisesController.name,
      );
    });

    it('should throw ForbiddenException when user tries to update exercise owned by another user', async () => {
      await testForbiddenException(
        controller.update.bind(controller),
        mockExerciseId,
        ExercisesService,
        mockExercisesService,
        Resource.EXERCISE,
      );
    });
  });

  describe('delete', () => {
    it('should successfully delete exercise when valid ID is provided', async () => {
      mockExercisesService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(mockExerciseId);

      expect(result).toBeUndefined();
      expect(mockExercisesService.delete).toHaveBeenCalledWith(mockExerciseId);
    });

    it('should throw NotFoundException when trying to delete non-existing exercise', async () => {
      const mockExerciseId = 'non-existing-id';
      mockExercisesService.delete.mockRejectedValue(
        new NotFoundException('Exercise not found or has been deleted'),
      );

      await expect(controller.delete(mockExerciseId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should log information about deleting the exercise', async () => {
      mockExercisesService.delete.mockResolvedValue(undefined);

      await controller.delete(mockExerciseId);

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        `Deleting exercise with ID: ${mockExerciseId}`,
        ExercisesController.name,
      );
    });

    it('should throw ForbiddenException when user tries to delete set owned by another user', async () => {
      await testForbiddenException(
        controller.delete.bind(controller),
        mockExerciseId,
        ExercisesService,
        mockExercisesService,
        Resource.EXERCISE,
      );
    });
  });
});
