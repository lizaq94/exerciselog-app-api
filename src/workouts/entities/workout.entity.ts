import { Workout } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseEntity } from '../../exercises/entities/exercise.entity';

export class WorkoutEntity implements Workout {
  @ApiProperty({
    description: 'Unique identifier for the workout',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the workout',
    example: 'Morning Strength Training',
  })
  name: string;

  @ApiProperty({
    description: 'Date when the workout took place',
    example: new Date('2023-10-21T10:00:00.000Z'),
  })
  date: Date;

  @ApiProperty({
    description: 'Additional notes about the workout',
    example: 'Focus on lower body exercises',
  })
  notes: string;

  @ApiProperty({
    description: 'Duration of the workout in minutes',
    example: 60,
  })
  duration: number;

  @ApiProperty({
    description: 'List of exercises performed during the workout',
    type: ExerciseEntity,
    isArray: true,
    required: false,
  })
  exercises?: ExerciseEntity[];

  @ApiProperty({
    description:
      'Identifier of the user associated with the workout. Can be null if no user is assigned.',
    required: false,
    example: 'user-4567-e89b-12d3-a456-426614174001',
  })
  userId: string | null;

  @ApiProperty({
    description: 'The date and time when the workout was created',
    example: '2025-01-01T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the workout data was last updated',
    example: '2025-01-15T08:21:45.123Z',
  })
  updatedAt: Date;
}
