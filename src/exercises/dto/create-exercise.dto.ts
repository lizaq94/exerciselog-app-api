import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateExerciseDto {
  @ApiProperty({ description: 'Exercise name', example: 'Bench press' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The position of the exercise in a workout sequence',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({ description: 'Type of the exercise', example: 'Strength' })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Optional notes about the exercise',
    required: false,
  })
  @IsString()
  notes: string;
}
