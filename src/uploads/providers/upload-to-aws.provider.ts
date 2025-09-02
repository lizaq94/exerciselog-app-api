import { Injectable, RequestTimeoutException } from '@nestjs/common';
import * as path from 'node:path';
import { v4 as uuid4 } from 'uuid';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class UploadToAwsProvider {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
  }
  public async fileUpload(file: Express.Multer.File) {
    try {
      const key = this.generateFileName(file);

      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
          Body: file.buffer,
          Key: key,
          ContentType: file.mimetype,
        }),
      );

      return this.generateFileName(file);
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
