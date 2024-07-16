import { ExerciseDto } from '../../common/dto/exercise.dto';

export class WorkoutDto {
  id: number;
  user_id: number;
  name: string;
  date: string;
  notes: string;
  duration: number;
  exercises: ExerciseDto;
}
