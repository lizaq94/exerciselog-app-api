import { DataResponseDto } from '../../common/interceptors/data-response/data-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ExerciseEntity } from '../entities/exercise.entity';

export class ExerciseResponseDto extends DataResponseDto {
  @ApiProperty({ type: ExerciseEntity, description: 'Exercise data' })
  data: ExerciseEntity;
}
