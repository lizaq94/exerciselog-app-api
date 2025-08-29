import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '../config/config.service';
import { UserEntity } from '../users/entities/user.entity';
import { TokenPayload } from './interfaces/token-payload.interface';

describe('Auth Strategies', () => {
  const mockUser: UserEntity = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    refreshToken: 'hashedRefreshToken',
    workouts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthConfig = {
    jwtAccessTokenSecret: 'access-secret',
    jwtRefreshTokenSecret: 'refresh-secret',
    jwtAccessTokenExpiration: '86400000',
    jwtRefreshTokenExpiration: '604800000',
  };

  const mockTokenPayload: TokenPayload = {
    userId: '1',
  };

  describe('LocalStrategy', () => {
    let localStrategy: LocalStrategy;
    let mockAuthService: jest.Mocked<AuthService>;

    beforeEach(async () => {
      const mockAuthServiceFactory = () => ({
        validateUser: jest.fn(),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LocalStrategy,
          {
            provide: AuthService,
            useFactory: mockAuthServiceFactory,
          },
        ],
      }).compile();

      localStrategy = module.get<LocalStrategy>(LocalStrategy);
      mockAuthService = module.get(AuthService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('validate', () => {
      const email = 'test@example.com';
      const password = 'password123';

      it('should call authService.validateUser with email and password', async () => {
        mockAuthService.validateUser.mockResolvedValue(mockUser);

        await localStrategy.validate(email, password);

        expect(mockAuthService.validateUser).toHaveBeenCalledWith(
          email,
          password,
        );
      });

      it('should return user object on successful validation', async () => {
        mockAuthService.validateUser.mockResolvedValue(mockUser);

        const result = await localStrategy.validate(email, password);

        expect(result).toEqual(mockUser);
      });

      it('should throw an exception when validation fails', async () => {
        const error = new UnauthorizedException('Credentials are not valid.');
        mockAuthService.validateUser.mockRejectedValue(error);

        await expect(localStrategy.validate(email, password)).rejects.toThrow(
          error,
        );

        expect(mockAuthService.validateUser).toHaveBeenCalledWith(
          email,
          password,
        );
      });
    });
  });

  describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let mockUsersService: jest.Mocked<UsersService>;
    let mockConfigService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
      const mockUsersServiceFactory = () => ({
        findOneById: jest.fn(),
      });

      const mockConfigServiceFactory = () => ({
        getAuthConfig: jest.fn().mockReturnValue(mockAuthConfig),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: UsersService,
            useFactory: mockUsersServiceFactory,
          },
          {
            provide: ConfigService,
            useFactory: mockConfigServiceFactory,
          },
        ],
      }).compile();

      mockUsersService = module.get(UsersService);
      mockConfigService = module.get(ConfigService);
      jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('validate', () => {
      it('should call usersService.findOneById with userId from payload', async () => {
        mockUsersService.findOneById.mockResolvedValue(mockUser);

        await jwtStrategy.validate(mockTokenPayload);

        expect(mockUsersService.findOneById).toHaveBeenCalledWith(
          mockTokenPayload.userId,
        );
      });

      it('should return the user object if found', async () => {
        mockUsersService.findOneById.mockResolvedValue(mockUser);

        const result = await jwtStrategy.validate(mockTokenPayload);

        expect(result).toEqual(mockUser);
      });
    });
  });

  describe('JwtRefreshStrategy', () => {
    let jwtRefreshStrategy: JwtRefreshStrategy;
    let mockAuthService: jest.Mocked<AuthService>;
    let mockConfigService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
      const mockAuthServiceFactory = () => ({
        verifyUserRefreshToken: jest.fn(),
      });

      const mockConfigServiceFactory = () => ({
        getAuthConfig: jest.fn().mockReturnValue(mockAuthConfig),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtRefreshStrategy,
          {
            provide: AuthService,
            useFactory: mockAuthServiceFactory,
          },
          {
            provide: ConfigService,
            useFactory: mockConfigServiceFactory,
          },
        ],
      }).compile();

      mockAuthService = module.get(AuthService);
      mockConfigService = module.get(ConfigService);
      jwtRefreshStrategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('validate', () => {
      const mockRequest = {
        cookies: {
          Refresh: 'refresh-token',
        },
      } as unknown as Request;

      it('should call authService.verifyUserRefreshToken with token and userId', async () => {
        mockAuthService.verifyUserRefreshToken.mockResolvedValue(mockUser);

        await jwtRefreshStrategy.validate(mockRequest, mockTokenPayload);

        expect(mockAuthService.verifyUserRefreshToken).toHaveBeenCalledWith(
          mockRequest.cookies?.Refresh,
          mockTokenPayload.userId,
        );
      });

      it('should return the user object if token is valid', async () => {
        mockAuthService.verifyUserRefreshToken.mockResolvedValue(mockUser);

        const result = await jwtRefreshStrategy.validate(
          mockRequest,
          mockTokenPayload,
        );

        expect(result).toEqual(mockUser);
      });

      it('should throw an exception when token verification fails', async () => {
        const error = new UnauthorizedException('Refresh token is not valid.');
        mockAuthService.verifyUserRefreshToken.mockRejectedValue(error);

        await expect(
          jwtRefreshStrategy.validate(mockRequest, mockTokenPayload),
        ).rejects.toThrow(error);

        expect(mockAuthService.verifyUserRefreshToken).toHaveBeenCalledWith(
          mockRequest.cookies?.Refresh,
          mockTokenPayload.userId,
        );
      });
    });
  });
});
