import { OmitType } from '@nestjs/swagger';
import { WorkoutDto } from './workout.dto';

export class CreateWorkoutDto extends OmitType(WorkoutDto, [
  'id',
  'exercises',
]) {}
