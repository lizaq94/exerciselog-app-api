import { IsString, IsIn, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export class GenerateWorkoutDto {
  @ApiProperty({
    description: 'Training goal',
    example: 'Build muscle mass',
  })
  @IsString()
  goal: string;

  @ApiProperty({
    description: 'Experience level',
    enum: ExperienceLevel,
    example: ExperienceLevel.INTERMEDIATE,
  })
  @IsIn(Object.values(ExperienceLevel))
  experienceLevel: string;

  @ApiProperty({
    description: 'Number of training days per week',
    minimum: 1,
    example: 3,
  })
  @IsInt()
  @Min(1)
  daysPerWeek: number;

  @ApiProperty({
    description: 'Training duration in minutes',
    minimum: 20,
    example: 60,
  })
  @IsInt()
  @Min(20)
  durationInMinutes: number;

  @ApiProperty({
    description: 'Available equipment',
    required: false,
    example: 'Dumbbells, barbell, bench',
  })
  @IsString()
  @IsOptional()
  availableEquipment?: string;
}
