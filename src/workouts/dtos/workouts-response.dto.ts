import { DataResponseDto } from '../../common/interceptors/data-response/data-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { WorkoutEntity } from '../entities/workout.entity';

export class WorkoutsResponseDto extends DataResponseDto {
  @ApiProperty({
    type: WorkoutEntity,
    isArray: true,
    description: 'Workouts data',
  })
  data: WorkoutEntity[];
}
