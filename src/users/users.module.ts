import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';
import { WorkoutsModule } from '../workouts/workouts.module';

@Module({
  imports: [DatabaseModule, WorkoutsModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
