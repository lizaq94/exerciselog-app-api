import { Test, TestingModule } from '@nestjs/testing';
import { RequestTimeoutException } from '@nestjs/common';
import { StorageProvider } from './storage.provider';
import { ConfigService } from '../../config/config.service';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid4 } from 'uuid';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn((input) => ({ input })),
}));
jest.mock('uuid');

describe('StorageProvider', () => {
  let provider: StorageProvider;
  let mockS3Send: jest.Mock;

  let mockFile: Express.Multer.File;

  const storageConfig = {
    endpoint: 'https://test-account.r2.cloudflarestorage.com',
    region: 'auto',
    accessKeyId: 'test-access-key',
    secretAccessKey: 'test-secret-key',
    bucketName: 'test-bucket',
    publicUrl: 'https://test-cdn.example.com',
  };

  beforeEach(async () => {
    mockS3Send = jest.fn();

    (S3Client as jest.MockedClass<typeof S3Client>).mockImplementation(
      () =>
        ({
          send: mockS3Send,
        }) as any,
    );

    const mockConfigService = {
      getStorageConfig: jest.fn().mockReturnValue(storageConfig),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<StorageProvider>(StorageProvider);

    mockFile = {
      originalname: 'test file.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test file content'),
      size: 1024,
      fieldname: 'file',
      encoding: '7bit',
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    (uuid4 as jest.Mock).mockReturnValue('mocked-uuid-1234');
    jest.spyOn(Date, 'now').mockReturnValue(1640995200000);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should configure the S3 client with the storage endpoint and region', () => {
    expect(S3Client).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: storageConfig.endpoint,
        region: storageConfig.region,
        credentials: {
          accessKeyId: storageConfig.accessKeyId,
          secretAccessKey: storageConfig.secretAccessKey,
        },
        forcePathStyle: true,
      }),
    );
  });

  describe('fileUpload', () => {
    it('should call S3Client.send with PutObjectCommand and correct parameters', async () => {
      mockS3Send.mockResolvedValue({});

      await provider.fileUpload(mockFile);

      expect(mockS3Send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'test-bucket',
            Body: mockFile.buffer,
            Key: 'testfile-1640995200000-mocked-uuid-1234.jpg',
            ContentType: 'image/jpeg',
          }),
        }),
      );
    });

    it('should return the generated file name on successful upload', async () => {
      mockS3Send.mockResolvedValue({});

      const result = await provider.fileUpload(mockFile);

      expect(result).toBe('testfile-1640995200000-mocked-uuid-1234.jpg');
    });

    it('should throw RequestTimeoutException if the upload fails', async () => {
      const s3Error = new Error('S3 connection failed');
      mockS3Send.mockRejectedValue(s3Error);

      await expect(provider.fileUpload(mockFile)).rejects.toThrow(
        RequestTimeoutException,
      );
    });
  });

  describe('generateFileName', () => {
    it('should generate a unique file name containing the original name, timestamp, and uuid', () => {
      const testFile = {
        originalname: 'myimage.png',
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('test'),
        stream: null as any,
      };

      const result = provider['generateFileName'](testFile);

      expect(result).toBe('myimage-1640995200000-mocked-uuid-1234.png');
      expect(result).toContain('myimage');
      expect(result).toContain('1640995200000');
      expect(result).toContain('mocked-uuid-1234');
      expect(result).toContain('.png');
    });

    it('should sanitize the original file name by removing spaces', () => {
      const testFile = {
        originalname: 'my test image file.jpg',
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('test'),
        stream: null as any,
      };

      const result = provider['generateFileName'](testFile);

      expect(result).toBe('mytestimagefile-1640995200000-mocked-uuid-1234.jpg');
      expect(result).not.toContain(' ');
    });
  });
});
