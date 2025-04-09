import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './providers/uploads.service';
import { UploadToAwsProvider } from './providers/upload-to-aws.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, UploadToAwsProvider],
  imports: [DatabaseModule],
})
export class UploadsModule {}
