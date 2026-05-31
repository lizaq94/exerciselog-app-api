import { Injectable, RequestTimeoutException } from '@nestjs/common';
import * as path from 'node:path';
import { v4 as uuid4 } from 'uuid';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class StorageProvider {
  private s3: S3Client;

  constructor(private readonly configService: ConfigService) {
    const { endpoint, region, accessKeyId, secretAccessKey } =
      this.configService.getStorageConfig();

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  public async fileUpload(file: Express.Multer.File) {
    try {
      const { bucketName } = this.configService.getStorageConfig();
      const key = this.generateFileName(file);

      await this.s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Body: file.buffer,
          Key: key,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );

      return key;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }

  private generateFileName(file: Express.Multer.File): string {
    const { name } = path.parse(file.originalname);

    const sanitized = name.replace(/\s/g, '').trim();
    const extension = path.extname(file.originalname);
    const timestamp = Date.now().toString();

    return `${sanitized}-${timestamp}-${uuid4()}${extension}`;
  }
}
