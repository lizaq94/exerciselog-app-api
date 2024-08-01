import { Type } from 'class-transformer';
import { ExerciseDto } from '../../common/dto/exercise.dto';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

export class WorkoutDto {
  id: number;

  @IsString()
  name: string;

  @IsString()
  notes: string;
  @IsNumber()
  duration: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  exercises: ExerciseDto[];
}
