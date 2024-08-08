import { OmitType } from '@nestjs/swagger';
import { WorkoutDto } from '../../common/dto/workout.dto';

export class CreateWorkoutDto extends OmitType(WorkoutDto, [
  'id',
  'exercises',
]) {}
