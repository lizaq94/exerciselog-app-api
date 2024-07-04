import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExercisesModule } from './exercises/exercises.module';

@Module({
  imports: [ExercisesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
