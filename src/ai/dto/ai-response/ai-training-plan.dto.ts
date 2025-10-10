import { IsString, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AiExerciseDto } from './ai-exercise.dto';

export class AiTrainingPlanDto {
  @ApiProperty({
    description: 'Name of the training plan',
    example: 'Trening A (Push)',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description and notes about the training plan',
    example:
      'Trening skupiony na mięśniach pchających. Pamiętaj, że technika jest ważniejsza niż ciężar.',
  })
  @IsString()
  notes: string;

  @ApiProperty({
    description: 'Duration of the workout in minutes',
    example: 60,
    minimum: 20,
  })
  @IsInt()
  @Min(20)
  duration: number;

  @ApiProperty({
    description: 'List of exercises in this training plan',
    type: [AiExerciseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiExerciseDto)
  exercises: AiExerciseDto[];
}
