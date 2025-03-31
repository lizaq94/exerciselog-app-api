import { DataResponseDto } from '../../common/interceptors/data-response/data-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutEntity } from '../entities/workout.entity';

export class WorkoutResponseDto extends DataResponseDto {
  @ApiProperty({ type: WorkoutEntity, description: 'Workout data' })
  data: WorkoutEntity;
}
