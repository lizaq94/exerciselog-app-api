import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigModule } from '../config/config.module';

@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
  imports: [ConfigModule],
})
export class DatabaseModule {}
