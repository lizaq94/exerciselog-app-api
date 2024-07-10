import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { SetDto } from './set.dto';

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

  sets: SetDto[];
}
