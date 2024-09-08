import { Workout } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseEntity } from '../../exercises/entities/exercise.entity';

export class WorkoutEntity implements Workout {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  duration: number;

  @ApiProperty({ type: ExerciseEntity, isArray: true, required: false })
  exercises?: ExerciseEntity[];

  @ApiProperty({ required: false })
  userId: string | null;
}
