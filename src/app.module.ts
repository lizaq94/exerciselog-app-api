import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ExercisesModule } from './exercises/exercises.module';
import { SetsModule } from './sets/sets.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ExercisesModule,
    SetsModule,
    WorkoutsModule,
    DatabaseModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
