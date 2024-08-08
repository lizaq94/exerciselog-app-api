import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { SetsModule } from '../sets/sets.module';

@Module({
  imports: [DatabaseModule, SetsModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
