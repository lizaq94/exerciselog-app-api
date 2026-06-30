import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { StorageProvider } from './storage.provider';
import { DatabaseService } from '../../database/database.service';
import { UploadFile } from '../interfaces/upload-file.interface';
import { FileType } from '../enums/file-type.enum';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class UploadsService {
  constructor(
    private readonly storageProvider: StorageProvider,
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}
  public async uploadImage(file: Express.Multer.File, exerciseId: string) {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    if (
      !['image/jpeg', 'image/jpg', 'image/gif', 'image/png'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Mime type not supported.');
    }

    try {
      const name = await this.storageProvider.fileUpload(file);
      const { publicUrl } = this.configService.getStorageConfig();

      const uploadFile: UploadFile = {
        name,
        path: `${publicUrl}/${name}`,
        type: FileType.IMAGE,
        mime: file.mimetype,
        size: file.size,
      };

      return this.databaseService.upload.create({
        data: { ...uploadFile, exercise: { connect: { id: exerciseId } } },
      });
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
