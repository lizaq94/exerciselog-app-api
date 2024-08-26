import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compareValueWithHash, encrypt } from '../utils/bcrypt';
import { UserDto } from '../users/dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: UserDto, response) {
    const expireAccessToken = new Date();
    expireAccessToken.setTime(
      expireAccessToken.getTime() +
        parseInt(process.env.JWT_ACESS_TOKEN_EXPIRATION_MS),
    );

    const expireRefreshToken = new Date();
    expireRefreshToken.setTime(
      expireRefreshToken.getTime() +
        parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_ACESS_TOKEN_EXPIRATION_MS}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS}ms`,
    });

    await this.usersService.update(user.id, {
      refreshToken: await encrypt(refreshToken),
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: true,
      expires: expireAccessToken,
    });

    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: true,
      expires: expireRefreshToken,
    });
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOne(email);
      const isAuthorized = await compareValueWithHash(password, user.password);

      if (!isAuthorized) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.findOneById(userId);
      const authenticated = await compareValueWithHash(
        refreshToken,
        user.refreshToken,
      );

      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
