import { Exercise } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { SetEntity } from '../../sets/entities/set.entity';

export class ExerciseEntity implements Exercise {
  @ApiProperty({
    description: 'Unique identifier for the exercise',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the exercise',
    example: 'Bench Press',
  })
  name: string;

  @ApiProperty({
    description: 'The position of the exercise in the workout sequence',
    example: 1,
    minimum: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Type of the exercise, such as Strength, Cardio, or Mobility',
    example: 'Strength',
  })
  type: string;

  @ApiProperty({
    description: 'Optional notes for the exercise',
    example: 'Focus on controlled movement',
    required: false,
  })
  notes: string;

  @ApiProperty({
    description: 'A list of sets associated with the exercise',
    type: SetEntity,
    isArray: true,
  })
  sets?: SetEntity[];

  @ApiProperty({
    description: 'The ID of the associated workout or null if not linked',
    example: '29c18142-ce1d-41a5-9920-a376fe28f16f',
    nullable: true,
  })
  workoutId: string | null;

  @ApiProperty({
    description: 'The date and time when the exercise was created',
    example: '2025-01-01T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the exercise data was last updated',
    example: '2025-01-15T08:21:45.123Z',
  })
  updatedAt: Date;
}
