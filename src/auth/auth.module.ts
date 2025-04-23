import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule,
    ConfigModule.forFeature(jwtConfig),
    LoggerModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
  ],
  exports: [HashingProvider],
})
export class AuthModule {}
