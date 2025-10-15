import { Injectable } from '@nestjs/common';
import { GenerateWorkoutDto } from '../dto/generate-workout.dto';
import { OpenRouterProvider } from './open-router.provider';
import { AiResponseParserService } from '../services/ai-response-parser/ai-response-parser.service';
import { AiResponseTransformerService } from '../services/ai-response-transformer/ai-response-transformer.service';
import { LoggerService } from '../../logger/logger.service';
import { CreateWorkoutBulkDto } from '../../workouts/dto/bulk';

@Injectable()
export class AiService {
  constructor(
    private readonly openRouterProvider: OpenRouterProvider,
    private readonly parseService: AiResponseParserService,
    private readonly transformerService: AiResponseTransformerService,
    private readonly logger: LoggerService,
  ) {}

  async generateWorkout(
    generateWorkoutDto: GenerateWorkoutDto,
  ): Promise<CreateWorkoutBulkDto[]> {
    try {
      const rawResponse =
        await this.openRouterProvider.generateWorkout(generateWorkoutDto);
      const validateResponse = await this.parseService.parse(rawResponse);
      const workoutPlans =
        this.transformerService.transformToAppFormat(validateResponse);

      this.logger.log(
        `Successfully generated ${workoutPlans.length} workout plans`,
      );

      console.log('Kamil | workoutPlans: ', workoutPlans);
      return workoutPlans;
    } catch (error) {
      const contextualError = new Error(
        `Failed to generate workout for goal "${generateWorkoutDto.goal}": ${error.message}`,
      );
      contextualError.stack = error.stack;
      throw contextualError;
    }
  }
}
