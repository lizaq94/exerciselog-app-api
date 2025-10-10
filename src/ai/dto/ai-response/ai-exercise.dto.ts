import { IsString, IsInt, Min, IsIn, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AiSetDto } from './ai-set.dto';

export enum ExerciseType {
  WARMUP = 'warmup',
  MAIN = 'main',
  STRETCHING = 'stretching',
}

export class AiExerciseDto {
  @ApiProperty({
    description: 'Order of the exercise within the workout',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({
    description: 'Name of the exercise',
    example: 'Bench Press',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of the exercise',
    enum: ExerciseType,
    example: 'main',
  })
  @IsIn(Object.values(ExerciseType))
  type: string;

  @ApiProperty({
    description: 'Instructions and notes for the exercise',
    example: 'Focus on controlled movement. Keep your back straight.',
  })
  @IsString()
  notes: string;

  @ApiProperty({
    description: 'List of sets for this exercise',
    type: [AiSetDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiSetDto)
  sets: AiSetDto[];
}
