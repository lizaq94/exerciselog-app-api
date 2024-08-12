import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { WorkoutsModule } from '../workouts/workouts.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, WorkoutsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
