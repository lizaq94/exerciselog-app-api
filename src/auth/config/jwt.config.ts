import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwtAccessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS,
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
  jwtRefreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS,
}));
