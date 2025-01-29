import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { TokenPayload } from '../interfaces/token-payload.interface';
import { AuthService } from '../auth.service';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Refresh,
      ]),
      secretOrKey: jwtConfiguration.jwtRefreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    return this.authService.verifyUserRefreshToken(
      request.cookies?.Refresh,
      payload.userId,
    );
  }
}
