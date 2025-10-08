import { Set } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SetEntity implements Set {
  @ApiProperty({
    description: 'Unique identifier for the set',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Number of repetitions performed in the set',
    example: 10,
    minimum: 1,
  })
  repetitions: number;

  @ApiProperty({
    description: 'Weight used for the exercise in kilograms',
    example: 50,
    minimum: 0,
  })
  weight: number;

  @ApiProperty({
    description: 'Order of the set within the exercise sequence',
    example: 1,
    minimum: 1,
  })
  order: number;

  @ApiProperty({
    description:
      'Duration of the set in seconds (e.g., for timed exercises like planks)',
    example: 60,
    required: false,
  })
  durationInSeconds: number | null;

  @ApiProperty({
    description: 'Rest time after this set in seconds',
    example: 90,
    required: false,
  })
  restAfterSetInSeconds: number | null;

  @ApiProperty({
    description:
      'The ID of the associated exercise. Can be null if not linked to an exercise.',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
    nullable: true,
  })
  exerciseId: string | null;

  @ApiProperty({
    description: 'The date and time when the set was created',
    example: '2025-01-01T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the set data was last updated',
    example: '2025-01-15T08:21:45.123Z',
  })
  updatedAt: Date;
}
