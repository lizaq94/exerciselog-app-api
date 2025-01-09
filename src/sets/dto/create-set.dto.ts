import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateSetDto {
  @ApiProperty({
    description: 'Number of repetitions performed in the set',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  repetitions: number;

  @ApiProperty({
    description: 'Weight used for the exercise in kilograms',
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({
    description: 'Order of the set within the exercise sequence',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  order: number;
}
