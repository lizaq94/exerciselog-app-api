import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SetDto } from './set.dto';
import { Type } from 'class-transformer';

export class ExerciseDto {
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  order: number;

  @IsString()
  type: string;

  @IsString()
  notes: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets: SetDto[];
}
