import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'The password for the user account (must be a strong password)',
    example: 'Str0ngP@ssw0rd!',
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'The username for the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description:
      'Optional refresh token for the user, used to maintain sessions',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SGslTjOS_vw',
    required: false,
  })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}
