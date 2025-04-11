import { Module } from '@nestjs/common';
import { UploadsService } from './providers/uploads.service';
import { UploadToAwsProvider } from './providers/upload-to-aws.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  providers: [UploadsService, UploadToAwsProvider],
  imports: [DatabaseModule],
  exports: [UploadsService],
})
export class UploadsModule {}
