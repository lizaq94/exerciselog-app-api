import { OmitType } from '@nestjs/mapped-types';
import { WorkoutDto } from './workout.dto';

export class CreateWorkoutDto extends OmitType(WorkoutDto, ['id']) {}
