import { DataResponseDto } from '../../common/interceptors/data-response/data-response.dto';
import { UserEntity } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto extends DataResponseDto {
  @ApiProperty({ type: UserEntity, description: 'Api response' })
  data: UserEntity;
}
