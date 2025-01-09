import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginInDto } from './dto/sign-in.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    type: LoginInDto,
    description: 'User login credentials',
    examples: {
      example1: {
        value: {
          email: 'example@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    description: 'User successfully logged in and token returned.',
    type: UserEntity,
  })
  async login(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Post('signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Data for new user registration',
    examples: {
      example1: {
        value: {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'securepassword',
        },
      },
    },
  })
  @ApiResponse({
    description: 'User successfully registered and token returned.',
    type: UserEntity,
  })
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signup(createUserDto, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    description: 'Access token successfully refreshed.',
    type: UserEntity,
  })
  async refreshToken(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user, response);
  }

  @Post('logout')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    description: 'User successfully logged out.',
  })
  async logout(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(user, response);
  }
}
