import { forwardRef, Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { WorkoutsModule } from '../workouts/workouts.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    WorkoutsModule,
    LoggerModule,
    forwardRef(() => AuthModule),
    forwardRef(() => CaslModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
