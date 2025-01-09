import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWorkoutDto {
  @ApiProperty({
    description: 'The name of the workout',
    example: 'Morning Strength Training',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Additional notes or comments about the workout',
    example: 'Focus on lower body exercises',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes: string;

  @ApiProperty({
    description: 'The duration of the workout in minutes',
    example: 60,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  duration: number;
}
