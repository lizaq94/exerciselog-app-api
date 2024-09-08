import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateExerciseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsInt()
  order: number;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ required: false })
  @IsString()
  notes: string;
}
