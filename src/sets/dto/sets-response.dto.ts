import { DataResponseDto } from '../../common/interceptors/data-response/data-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SetEntity } from '../entities/set.entity';

export class SetsResponseDto extends DataResponseDto {
  @ApiProperty({
    type: SetEntity,
    isArray: true,
    description: 'Workouts data',
  })
  data: SetEntity[];
}
