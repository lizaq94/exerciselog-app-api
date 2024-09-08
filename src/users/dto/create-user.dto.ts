import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsStrongPassword()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @ApiProperty({ required: false })
  refreshToken?: string;
}
