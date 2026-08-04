import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

export class UserIdentityDto {
  @ApiProperty({
    description: 'The unique identifier for the user',
    example: 'e79a2fda-60a0-4422-bd0f-bd98b5f4ed3f',
  })
  id: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;
}

export function toUserIdentity(user: UserEntity): UserIdentityDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}
