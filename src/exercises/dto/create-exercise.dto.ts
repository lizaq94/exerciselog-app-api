import { OmitType } from '@nestjs/mapped-types';
import { ExerciseDto } from './exercise.dto';

export class CreateExerciseDto extends OmitType(ExerciseDto, ['id']) {}
