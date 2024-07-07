import { IsInt, IsNotEmpty, IsString } from 'class-validator';

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

  sets: {
    id: number;
    repetitions: number;
    weight: number;
    order: number;
  }[];
}
