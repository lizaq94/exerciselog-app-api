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
  findAll: jest.fn(),
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
  findAllSets: jest.fn(),
  addSet: jest.fn(),
};

const mockUploadsService = {
  uploadImage: jest.fn(),
  findOne: jest.fn(),
};

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

  describe('findAllSets', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return all sets for a specific exercise', async () => {
      const mockSets = [
        { id: 'set1', exerciseId: mockExerciseId, weight: 100, reps: 10 },
        { id: 'set2', exerciseId: mockExerciseId, weight: 110, reps: 8 },
      ];
      mockExercisesService.findAllSets.mockResolvedValue(mockSets);

      const result = await controller.findAllSets(mockExerciseId);

      expect(result).toEqual(mockSets);
      expect(mockExercisesService.findAllSets).toHaveBeenCalledWith(
        mockExerciseId,
      );
    });

    it('should log information about retrieving sets', async () => {
      const mockSets = [];
      mockExercisesService.findAllSets.mockResolvedValue(mockSets);

      await controller.findAllSets(mockExerciseId);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Retrieving sets for exercise ID: ${mockExerciseId}`,
        ExercisesController.name,
      );
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      const nonExistentExerciseId = 'non-existent-id';
      const notFoundError = new NotFoundException('Exercise not found');
      mockExercisesService.findAllSets.mockRejectedValue(notFoundError);

      await expect(
        controller.findAllSets(nonExistentExerciseId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user tries to fetch sets for exercise owned by another user', async () => {
      await testForbiddenException(
        controller.findAllSets.bind(controller),
        mockExerciseId,
        ExercisesService,
        mockExercisesService,
        Resource.EXERCISE,
      );
    });
  });

  describe('addSet', () => {
    const mockSetDto = { weight: 100, repetitions: 10, order: 1 };
    const mockNewSet = {
      id: 'set1',
      exerciseId: mockExerciseId,
      ...mockSetDto,
    };

    it('should add a new set to an exercise', async () => {
      mockExercisesService.addSet.mockResolvedValue(mockNewSet);

      const result = await controller.addSet(mockExerciseId, mockSetDto);

      expect(result).toEqual(mockNewSet);
      expect(mockExercisesService.addSet).toHaveBeenCalledWith(
        mockExerciseId,
        mockSetDto,
      );
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      const nonExistentExerciseId = 'non-existent-id';
      mockExercisesService.addSet.mockRejectedValue(
        new NotFoundException('Exercise not found'),
      );

      await expect(
        controller.addSet(nonExistentExerciseId, mockSetDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log information about adding a new set', async () => {
      mockExercisesService.addSet.mockResolvedValue(mockNewSet);

      await controller.addSet(mockExerciseId, mockSetDto);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Adding new set to exercise ID: ${mockExerciseId}`,
        ExercisesController.name,
      );
    });

    it('should throw ForbiddenException when user tries to add set to exercise owned by another user', async () => {
      await testForbiddenException(
        controller.addSet.bind(controller),
        mockExerciseId,
        ExercisesService,
        mockExercisesService,
        Resource.EXERCISE,
      );
    });
  });

  describe('uploadImage', () => {
    it('should upload an image for an exercise successfully', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1234,
      } as Express.Multer.File;
      const mockUploadResult = {
        id: 'upload-id',
        name: 'test.jpg',
        path: 'https://cdn.example.com/test.jpg',
        type: 'IMAGE',
        mime: 'image/jpeg',
        size: 1234,
      };
      (mockUploadsService.uploadImage as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockUploadResult);

      const result = await controller.uploadImage(mockExerciseId, mockFile);

      expect(mockUploadsService.uploadImage).toHaveBeenCalledWith(
        mockFile,
        mockExerciseId,
      );

      expect(result).toEqual(mockUploadResult);
    });

    it('should reject upload if no file is provided', async () => {
      (mockUploadsService.uploadImage as jest.Mock).mockRejectedValue(
        new Error('No file provided.'),
      );

      await expect(
        controller.uploadImage(mockExerciseId, undefined as any),
      ).rejects.toThrow('No file provided.');
      expect(mockUploadsService.uploadImage).toHaveBeenCalledWith(
        undefined,
        mockExerciseId,
      );
    });

    it('should reject upload if file type is invalid', async () => {
      const invalidFile = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
        size: 1234,
      } as Express.Multer.File;
      (mockUploadsService.uploadImage as jest.Mock).mockRejectedValue(
        new Error('Mime type not supported.'),
      );

      await expect(
        controller.uploadImage(mockExerciseId, invalidFile),
      ).rejects.toThrow('Mime type not supported.');
      expect(mockUploadsService.uploadImage).toHaveBeenCalledWith(
        invalidFile,
        mockExerciseId,
      );
    });

    it('should enforce ownership before allowing image upload', async () => {
      await testForbiddenException(
        controller.uploadImage.bind(controller),
        mockExerciseId,
        ExercisesService,
        mockExercisesService,
        Resource.EXERCISE,
        {
          originalname: 'test.jpg',
          mimetype: 'image/jpeg',
          buffer: Buffer.from('test'),
          size: 1234,
        } as Express.Multer.File,
      );
    });
  });
});
