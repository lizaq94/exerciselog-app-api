import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

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
  @IsOptional()
  @ApiProperty({ required: false })
  refreshToken?: string;
}
