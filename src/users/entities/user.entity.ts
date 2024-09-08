import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutEntity } from '../../workouts/entities/workout.entity';

export class UserEntity implements User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ required: false })
  refreshToken: string;

  @ApiProperty({ type: WorkoutEntity, isArray: true, required: false })
  workouts?: WorkoutEntity[];
}
