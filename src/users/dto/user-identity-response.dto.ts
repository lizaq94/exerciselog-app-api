import { ApiProperty } from '@nestjs/swagger';
import { DataResponseDto } from '../../common/interceptors/data-response/data-response.dto';
import { UserIdentityDto } from './user-identity.dto';

export class UserIdentityResponseDto extends DataResponseDto {
  @ApiProperty({ type: UserIdentityDto, description: 'Api response' })
  data: UserIdentityDto;
}
