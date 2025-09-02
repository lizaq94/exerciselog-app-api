import { Test, TestingModule } from '@nestjs/testing';
import { RequestTimeoutException } from '@nestjs/common';
import { UploadToAwsProvider } from './upload-to-aws.provider';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid4 } from 'uuid';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn((input) => ({ input })),
}));
jest.mock('uuid');

describe('UploadToAwsProvider', () => {
  let provider: UploadToAwsProvider;
  let mockS3Send: jest.Mock;

  let mockFile: Express.Multer.File;

  beforeEach(async () => {
    mockS3Send = jest.fn();

    (S3Client as jest.MockedClass<typeof S3Client>).mockImplementation(
      () =>
        ({
          send: mockS3Send,
        }) as any,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadToAwsProvider],
    }).compile();

    provider = module.get<UploadToAwsProvider>(UploadToAwsProvider);

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

    process.env.AWS_PUBLIC_BUCKET_NAME = 'test-bucket';
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';

    (uuid4 as jest.Mock).mockReturnValue('mocked-uuid-1234');
    jest.spyOn(Date, 'now').mockReturnValue(1640995200000);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

    it('should throw RequestTimeoutException if the S3 upload fails', async () => {
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
