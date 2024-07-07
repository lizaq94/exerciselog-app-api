import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExercisesModule } from './exercises/exercises.module';
import { SetsModule } from './sets/sets.module';

@Module({
  imports: [ExercisesModule, SetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
