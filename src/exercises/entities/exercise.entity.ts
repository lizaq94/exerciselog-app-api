import { Exercise } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { SetEntity } from '../../sets/entities/set.entity';

export class ExerciseEntity implements Exercise {
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  order: number;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false })
  notes: string;

  @ApiProperty({ type: SetEntity, isArray: true })
  sets?: SetEntity[];

  @ApiProperty()
  workoutId: string | null;
}
