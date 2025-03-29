import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutEntity } from '../../workouts/entities/workout.entity';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  @ApiProperty({
    description: 'The unique identifier for the user',
    example: 'e79a2fda-60a0-4422-bd0f-bd98b5f4ed3f',
  })
  id: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  @ApiProperty({
    description: 'A list of workouts associated with the user (optional)',
    type: WorkoutEntity,
    isArray: true,
    required: false,
  })
  workouts?: WorkoutEntity[];

  @ApiProperty({
    description: 'The date and time when the user was created',
    example: '2025-01-01T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the user data was last updated',
    example: '2025-01-15T08:21:45.123Z',
  })
  updatedAt: Date;
}
