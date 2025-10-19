import { Body, Controller, Post } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from './providers/ai.service';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';
import { CreateWorkoutBulkDto } from '../workouts/dto/bulk';

@Controller('ai')
@ApiTags('AI')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly logger: LoggerService,
  ) {}

  @Post('generate-workout')
  @ApiOperation({
    summary: 'Generate workout plans using AI',
    description:
      'Returns AI-generated training plans ready for user review. Plans are NOT saved to database automatically.',
  })
  @ApiResponse({
    status: 200,
    description: 'Training plans successfully generated',
    type: [CreateWorkoutBulkDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or AI returned malformed response',
  })
  @ApiResponse({
    status: 502,
    description: 'OpenRouter API error',
  })
  async generateWorkout(
    @Body() generateWorkoutDto: GenerateWorkoutDto,
  ): Promise<CreateWorkoutBulkDto[]> {
    this.logger.log(
      `Generating AI workout for goal: ${generateWorkoutDto.goal}, experience: ${generateWorkoutDto.experienceLevel}`,
      AiController.name,
    );

    return this.aiService.generateWorkout(generateWorkoutDto);
  }
}
