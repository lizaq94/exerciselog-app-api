import { Body, Controller, Post } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './providers/ai.service';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';

@Controller('ai')
@ApiTags('AI')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly logger: LoggerService,
  ) {}

  @Post('generate-workout')
  @ApiOperation({ summary: 'Generate a new workout plan using AI' })
  async generateWorkout(@Body() generateWorkoutDto: GenerateWorkoutDto) {
    this.logger.log(
      `Generating AI workout for goal: ${generateWorkoutDto.goal}, experience: ${generateWorkoutDto.experienceLevel}`,
      AiController.name,
    );

    return this.aiService.generateWorkout(generateWorkoutDto);
  }
}
