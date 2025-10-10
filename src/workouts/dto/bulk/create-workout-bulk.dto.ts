import {
  IsString,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateExerciseBulkDto } from './create-exercise-bulk.dto';

export class CreateWorkoutBulkDto {
  @ApiProperty({
    description: 'Name of the workout',
    example: 'Trening A (Push)',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Description and notes about the workout',
    example: 'Trening skupiony na mięśniach pchających...',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Duration of the workout in minutes',
    example: 60,
    required: false,
    minimum: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(20)
  duration?: number;

  @ApiProperty({
    description: 'List of exercises in this workout',
    type: [CreateExerciseBulkDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseBulkDto)
  exercises: CreateExerciseBulkDto[];
}
