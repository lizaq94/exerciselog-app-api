import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateWorkoutDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  notes: string;

  @ApiProperty({ required: false })
  @IsNumber()
  duration: number;
}
