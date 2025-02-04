import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginInDto } from './dto/sign-in.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoggerService } from '../logger/logger.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService,
  ) {}

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
    this.logger.log(`User login attempt: ${user.id}`, AuthController.name);
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
    status: 201,
    description: 'User successfully registered.',
    type: UserEntity,
  })
  async signUp(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log(`User registration attempt`, AuthController.name);
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
    this.logger.log(
      `Refreshing access token for user: ${user.id}`,
      AuthController.name,
    );
    return this.authService.login(user, response);
  }

  @Post('logout')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    description: 'User successfully logged out.',
  })
  @HttpCode(204)
  async logout(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.logger.log(`User logout: ${user.id}`, AuthController.name);
    return this.authService.logout(user, response);
  }
}
