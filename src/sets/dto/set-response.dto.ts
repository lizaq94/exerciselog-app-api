import { DataResponseDto } from '../../common/interceptors/data-response/data-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { SetEntity } from '../entities/set.entity';

export class SetResponseDto extends DataResponseDto {
  @ApiProperty({ type: SetEntity, description: 'Exercise data' })
  data: SetEntity;
}
