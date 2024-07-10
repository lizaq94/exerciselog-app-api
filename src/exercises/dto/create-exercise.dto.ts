import { OmitType } from '@nestjs/mapped-types';
import { ExerciseDto } from '../../common/dto/exercise.dto';

export class CreateExerciseDto extends OmitType(ExerciseDto, ['id']) {}
