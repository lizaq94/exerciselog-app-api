import { Injectable } from '@nestjs/common';
import { GenerateWorkoutDto } from '../dto/generate-workout.dto';
import { OpenRouterProvider } from './open-router.provider';

@Injectable()
export class AiService {
  constructor(private readonly openRouterProvider: OpenRouterProvider) {}

  async generateWorkout(generateWorkoutDto: GenerateWorkoutDto) {
    try {
      const result =
        await this.openRouterProvider.generateWorkout(generateWorkoutDto);

      return result;
    } catch (error) {
      const contextualError = new Error(
        `Failed to generate workout for goal "${generateWorkoutDto.goal}": ${error.message}`,
      );
      contextualError.stack = error.stack;
      throw contextualError;
    }
  }
}
