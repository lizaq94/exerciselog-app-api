import { Module } from '@nestjs/common';
import { UploadsService } from './providers/uploads.service';
import { StorageProvider } from './providers/storage.provider';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '../config/config.module';

@Module({
  providers: [UploadsService, StorageProvider],
  imports: [DatabaseModule, ConfigModule],
  exports: [UploadsService],
})
export class UploadsModule {}
