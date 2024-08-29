import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class SetDto {
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsNumber()
  repetitions: number;

  @ApiProperty()
  @IsNumber()
  weight: number;

  @ApiProperty()
  @IsNumber()
  order: number;

  exerciseId?: string;
}
