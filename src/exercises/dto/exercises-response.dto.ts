import { DataResponseDto } from '../../common/interceptors/data-response/data-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseEntity } from '../entities/exercise.entity';

export class ExercisesResponseDto extends DataResponseDto {
  @ApiProperty({
    type: ExerciseEntity,
    isArray: true,
    description: 'Workouts data',
  })
  data: ExerciseEntity[];
}
