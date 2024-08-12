import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsString,
  IsStrongPassword,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { WorkoutDto } from '../../common/dto/workout.dto';

export class UserDto {
  @IsUUID()
  @ApiProperty()
  id: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsStrongPassword()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutDto)
  workouts?: WorkoutDto[];
}
