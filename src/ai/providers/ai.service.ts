import { Injectable } from '@nestjs/common';
import { GenerateWorkoutDto } from '../dto/generate-workout.dto';

@Injectable()
export class AiService {
  generateWorkout(generateWorkoutDto: GenerateWorkoutDto) {
    return 'Workout generated';
  }
}
