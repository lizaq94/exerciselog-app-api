import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { SetDto } from './set.dto';

export class ExerciseDto {
  @IsUUID()
  id: string;

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

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets?: SetDto[];

  workoutId?: string;
}
