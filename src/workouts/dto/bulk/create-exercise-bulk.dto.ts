import { IsString, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSetBulkDto } from './create-set-bulk.dto';

export class CreateExerciseBulkDto {
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
    example: 'Strength',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Instructions and notes for the exercise',
    example: 'Focus on controlled movement',
  })
  @IsString()
  notes: string;

  @ApiProperty({
    description: 'List of sets for this exercise',
    type: [CreateSetBulkDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSetBulkDto)
  sets: CreateSetBulkDto[];
}
