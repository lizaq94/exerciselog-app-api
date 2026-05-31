import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { StorageProvider } from './storage.provider';
import { DatabaseService } from '../../database/database.service';
import { ConfigService } from '../../config/config.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

const PUBLIC_URL = 'https://test-cdn.example.com';

describe('UploadsService', () => {
  let service: UploadsService;
  let storageProvider: any;
  let databaseService: any;

  beforeEach(async () => {
    const mockStorageProvider = {
      fileUpload: jest.fn(),
    };

    const mockDatabaseService = {
      upload: {
        create: jest.fn(),
      },
    };

    const mockConfigService = {
      getStorageConfig: jest.fn().mockReturnValue({ publicUrl: PUBLIC_URL }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: StorageProvider,
          useValue: mockStorageProvider,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    storageProvider = module.get(StorageProvider);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should successfully upload valid image file', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: null,
      };

      const exerciseId = 'test-exercise-id';
      const generatedFileName = 'test-image-1234567890-uuid.jpg';
      const expectedUploadData = {
        name: generatedFileName,
        path: `${PUBLIC_URL}/${generatedFileName}`,
        type: 'IMAGE',
        mime: 'image/jpeg',
        size: 1024,
        exercise: { connect: { id: exerciseId } },
      };
      const expectedResult = {
        id: 'upload-id',
        ...expectedUploadData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storageProvider.fileUpload.mockResolvedValue(generatedFileName);
      databaseService.upload.create.mockResolvedValue(expectedResult);

      const result = await service.uploadImage(mockFile, exerciseId);

      expect(storageProvider.fileUpload).toHaveBeenCalledWith(mockFile);
      expect(databaseService.upload.create).toHaveBeenCalledWith({
        data: expectedUploadData,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when no file provided', async () => {
      const exerciseId = 'test-exercise-id';

      await expect(service.uploadImage(null, exerciseId)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.uploadImage(null, exerciseId)).rejects.toThrow(
        'No file provided.',
      );

      expect(storageProvider.fileUpload).not.toHaveBeenCalled();
      expect(databaseService.upload.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for unsupported mime type', async () => {
      const exerciseId = 'test-exercise-id';
      const unsupportedMimeTypes = [
        'application/pdf',
        'text/plain',
        'video/mp4',
        'audio/mp3',
        'image/bmp',
        'image/tiff',
      ];

      for (const mimetype of unsupportedMimeTypes) {
        const mockFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: 'test-file.pdf',
          encoding: '7bit',
          mimetype,
          size: 1024,
          buffer: Buffer.from('fake file data'),
          destination: '',
          filename: '',
          path: '',
          stream: null,
        };

        await expect(service.uploadImage(mockFile, exerciseId)).rejects.toThrow(
          BadRequestException,
        );

        await expect(service.uploadImage(mockFile, exerciseId)).rejects.toThrow(
          'Mime type not supported.',
        );
      }

      expect(storageProvider.fileUpload).not.toHaveBeenCalled();
      expect(databaseService.upload.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when upload fails', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: null,
      };

      const exerciseId = 'test-exercise-id';
      const uploadError = new Error('AWS upload failed');

      storageProvider.fileUpload.mockRejectedValue(uploadError);

      await expect(service.uploadImage(mockFile, exerciseId)).rejects.toThrow(
        ConflictException,
      );

      expect(storageProvider.fileUpload).toHaveBeenCalledWith(mockFile);
      expect(databaseService.upload.create).not.toHaveBeenCalled();
    });
  });
});
