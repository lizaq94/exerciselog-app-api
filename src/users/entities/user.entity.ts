import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutEntity } from '../../workouts/entities/workout.entity';

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

  @ApiProperty({
    description: 'The hashed password of the user',
    example: 'Str0ngP@ssw0rd!',
  })
  password: string;

  @ApiProperty({
    description:
      'The refresh token used to maintain the user session (optional)',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SGslTjOS_vw',
    required: false,
  })
  refreshToken: string;

  @ApiProperty({
    description: 'A list of workouts associated with the user (optional)',
    type: WorkoutEntity,
    isArray: true,
    required: false,
  })
  workouts?: WorkoutEntity[];
}
