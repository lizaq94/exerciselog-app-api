import { OmitType } from '@nestjs/swagger';
import { ExerciseDto } from '../../common/dto/exercise.dto';

export class CreateExerciseDto extends OmitType(ExerciseDto, [
  'id',
  'sets',
  'workoutId',
]) {}
