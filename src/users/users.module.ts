import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { WorkoutsModule } from '../workouts/workouts.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HashingModule } from '../common/hashing/hashing.module';

@Module({
  imports: [WorkoutsModule, LoggerModule, HashingModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
