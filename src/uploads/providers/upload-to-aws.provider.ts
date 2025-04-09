import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as path from 'node:path';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class UploadToAwsProvider {
  public async fileUpload(file: Express.Multer.File) {
    const s3 = new S3();

    try {
      const uploadResult = await s3
        .upload({
          Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
          Body: file.buffer,
          Key: this.generateFileName(file),
          ContentType: file.mimetype,
        })
        .promise();

      return uploadResult.Key;
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
