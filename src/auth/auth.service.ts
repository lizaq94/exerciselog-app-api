import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UserEntity } from '../users/entities/user.entity';
import { Response } from 'express';
import { MailService } from '../mail/provider/mail.service';
import { ConfigService } from '../config/config.service';
import { HashingProvider } from '../common/hashing/hashing.provider';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthService {
  private ACCESS_TOKEN_COOKIE = 'Authentication';
  private REFRESH_TOKEN_COOKIE = 'Refresh';
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly hashingProvider: HashingProvider,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  async login(user: UserEntity, response: Response) {
    const { accessToken, refreshToken, expireAccessToken, expireRefreshToken } =
      this.generateTokens(user.id);

    await this.setCookies(
      response,
      user.id,
      accessToken,
      refreshToken,
      expireAccessToken,
      expireRefreshToken,
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async signup(userData: CreateUserDto, response: Response) {
    let newUser;

    try {
      newUser = await this.usersService.create(userData);
    } catch (error) {
      if (error.message?.includes('is already taken')) {
        throw new UnauthorizedException('User already exists.');
      }
      throw error;
    }

    const { accessToken, refreshToken, expireAccessToken, expireRefreshToken } =
      this.generateTokens(newUser.id);

    await this.setCookies(
      response,
      newUser.id,
      accessToken,
      refreshToken,
      expireAccessToken,
      expireRefreshToken,
    );

    if (this.configService.getAppConfig().nodeEnv === 'production') {
      try {
        await this.mailService.sendUserWelcome(newUser);
      } catch (error) {
        throw new RequestTimeoutException(error);
      }
    }

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };
  }

  async logout(user: UserEntity, response: Response) {
    await this.usersService.update(user.id, { refreshToken: null });
    this.clearCookies(response);
  }

  private generateTokens(userId: string) {
    const authConfig = this.configService.getAuthConfig();

    const expireAccessToken = new Date();
    expireAccessToken.setTime(
      expireAccessToken.getTime() +
        parseInt(authConfig.jwtAccessTokenExpiration),
    );

    const expireRefreshToken = new Date();
    expireRefreshToken.setTime(
      expireRefreshToken.getTime() +
        parseInt(authConfig.jwtRefreshTokenExpiration),
    );

    const tokenPayload: TokenPayload = {
      userId: userId,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: authConfig.jwtAccessTokenSecret,
      expiresIn: `${authConfig.jwtAccessTokenExpiration}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: authConfig.jwtRefreshTokenSecret,
      expiresIn: `${authConfig.jwtRefreshTokenExpiration}ms`,
    });

    return { expireAccessToken, expireRefreshToken, accessToken, refreshToken };
  }

  private async setCookies(
    response: Response,
    userId: string,
    accessToken: string,
    refreshToken: string,
    expireAccessToken: Date,
    expireRefreshToken: Date,
  ) {
    await this.usersService.update(userId, {
      refreshToken: await this.hashingProvider.encrypt(refreshToken),
    });

    const isProduction =
      this.configService.getAppConfig().nodeEnv === 'production';

    response.cookie(this.ACCESS_TOKEN_COOKIE, accessToken, {
      sameSite: 'lax',
      httpOnly: true,
      secure: isProduction,
      expires: expireAccessToken,
    });

    response.cookie(this.REFRESH_TOKEN_COOKIE, refreshToken, {
      sameSite: 'lax',
      httpOnly: true,
      secure: isProduction,
      expires: expireRefreshToken,
    });
  }

  private clearCookies(response: Response) {
    response.clearCookie(this.REFRESH_TOKEN_COOKIE);
    response.clearCookie(this.ACCESS_TOKEN_COOKIE);
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOne(email);
      const isAuthorized = await this.hashingProvider.compareValueWithHash(
        password,
        user.password,
      );

      if (!isAuthorized) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      this.logger.error(
        `User validation failed: ${error?.stack}`,
        AuthService.name,
      );
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.findOneById(userId);

      if (!user.refreshToken) {
        throw new UnauthorizedException('No refresh token found for user.');
      }

      const authenticated = await this.hashingProvider.compareValueWithHash(
        refreshToken,
        user.refreshToken,
      );

      if (!authenticated) {
        throw new UnauthorizedException('Refresh token comparison failed.');
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Refresh token verification failed: ${error?.stack}`,
        AuthService.name,
      );
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
