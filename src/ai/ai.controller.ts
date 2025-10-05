import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './providers/ai.service';
import { GenerateWorkoutDto } from './dto/generate-workout.dto';

@Controller('ai')
@ApiTags('AI')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-wrokut')
  @ApiOperation({ summary: 'Generate a new wrokout plan using AI' })
  async generateWorkout(@Body() generateWorkoutDto: GenerateWorkoutDto) {
    return this.aiService.generateWorkout(generateWorkoutDto);
  }
}
