import { Set } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SetEntity implements Set {
  @ApiProperty()
  id: string;

  @ApiProperty()
  repetitions: number;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  order: number;

  @ApiProperty()
  exerciseId: string | null;
}
