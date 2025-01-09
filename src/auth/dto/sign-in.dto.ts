import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginInDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User email address used for logging in',
    example: 'example@example.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User password associated with the email address',
    example: 'password123',
  })
  password: string;
}
