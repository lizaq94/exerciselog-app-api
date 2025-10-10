import { IsInt, Min, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSetBulkDto {
  @ApiProperty({
    description: 'Order of the set within the exercise',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  order: number;

  @ApiProperty({
    description: 'Number of repetitions in the set',
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  repetitions: number;

  @ApiProperty({
    description: 'Weight used for the set in kilograms',
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({
    description: 'Duration of the set in seconds (for timed exercises)',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationInSeconds?: number;

  @ApiProperty({
    description: 'Rest time after this set in seconds',
    example: 90,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  restAfterSetInSeconds?: number;
}
