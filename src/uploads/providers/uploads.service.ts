import {
  BadRequestException,
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { UploadToAwsProvider } from './upload-to-aws.provider';
import { DatabaseService } from '../../database/database.service';
import { UploadFile } from '../interfaces/upload-file.interfece';
import { FileType } from '../enums/file-type.enum';

@Injectable()
export class UploadsService {
  constructor(
    private readonly uploadToAwsProvider: UploadToAwsProvider,
    private readonly databaseService: DatabaseService,
  ) {}
  public async uploadImage(file: Express.Multer.File) {
    if (
      !['image/jpeg', 'image/jpg', 'image/gif', 'image/png'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Mime type not supported.');
    }

    try {
      const name = await this.uploadToAwsProvider.fileUpload(file);

      const uploadFile: UploadFile = {
        name,
        path: `https://${process.env.AWS_CLOUDFRONT_URL}/${name}`,
        type: FileType.IMAGE,
        mime: file.mimetype,
        size: file.size,
      };

      return this.databaseService.upload.create({ data: uploadFile });
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
