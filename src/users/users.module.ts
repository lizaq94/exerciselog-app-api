import { Module } from '@nestjs/common';
import { WorkoutsModule } from '../workouts/workouts.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [WorkoutsModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
