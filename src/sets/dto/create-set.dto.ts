import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateSetDto {
  @ApiProperty()
  @IsNumber()
  repetitions: number;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiProperty()
  @IsNumber()
  order: number;
}
