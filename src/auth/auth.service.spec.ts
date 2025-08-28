import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { HashingProvider } from './providers/hashing.provider';
import { MailService } from '../mail/provider/mail.service';
import { UnauthorizedException, RequestTimeoutException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { Response } from 'express';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockHashingProvider: jest.Mocked<HashingProvider>;
  let mockMailService: jest.Mocked<MailService>;
  let mockResponse: Partial<Response>;

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

  beforeEach(async () => {
    const mockUsersServiceFactory = () => ({
      findOne: jest.fn(),
      findOneById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    });

    const mockJwtServiceFactory = () => ({
      sign: jest.fn(),
    });

    const mockConfigServiceFactory = () => ({
      getAuthConfig: jest.fn(),
    });

    const mockHashingProviderFactory = () => ({
      encrypt: jest.fn(),
      compareValueWithHash: jest.fn(),
    });

    const mockMailServiceFactory = () => ({
      sendUserWelcome: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useFactory: mockUsersServiceFactory,
        },
        {
          provide: JwtService,
          useFactory: mockJwtServiceFactory,
        },
        {
          provide: ConfigService,
          useFactory: mockConfigServiceFactory,
        },
        {
          provide: HashingProvider,
          useFactory: mockHashingProviderFactory,
        },
        {
          provide: MailService,
          useFactory: mockMailServiceFactory,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUsersService = module.get(UsersService);
    mockJwtService = module.get(JwtService);
    mockConfigService = module.get(ConfigService);
    mockHashingProvider = module.get(HashingProvider);
    mockMailService = module.get(MailService);

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    mockConfigService.getAuthConfig.mockReturnValue(mockAuthConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    };

    it('should create a new user, generate tokens, set cookies, and send a welcome email', async () => {
      const newUser = { ...mockUser, id: '2', email: createUserDto.email };

      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(newUser);
      mockUsersService.update.mockResolvedValue(newUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockHashingProvider.encrypt.mockResolvedValue('hashedRefreshToken');
      mockMailService.sendUserWelcome.mockResolvedValue(undefined);

      await service.signup(createUserDto, mockResponse as Response);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(
        createUserDto.email,
        false,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockHashingProvider.encrypt).toHaveBeenCalledWith('refresh-token');
      expect(mockUsersService.update).toHaveBeenCalledWith(newUser.id, {
        refreshToken: 'hashedRefreshToken',
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Authentication',
        'access-token',
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Refresh',
        'refresh-token',
        expect.any(Object),
      );
      expect(mockMailService.sendUserWelcome).toHaveBeenCalledWith(newUser);
    });

    it('should throw UnauthorizedException if a user with the given email already exists', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      await expect(
        service.signup(createUserDto, mockResponse as Response),
      ).rejects.toThrow(new UnauthorizedException('User already exists.'));

      expect(mockUsersService.findOne).toHaveBeenCalledWith(
        createUserDto.email,
        false,
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
      expect(mockMailService.sendUserWelcome).not.toHaveBeenCalled();
    });

    it('should throw RequestTimeoutException if MailService fails', async () => {
      const newUser = { ...mockUser, id: '2', email: createUserDto.email };
      const mailError = new Error('Mail service error');

      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(newUser);
      mockUsersService.update.mockResolvedValue(newUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockHashingProvider.encrypt.mockResolvedValue('hashedRefreshToken');
      mockMailService.sendUserWelcome.mockRejectedValue(mailError);

      await expect(
        service.signup(createUserDto, mockResponse as Response),
      ).rejects.toThrow(new RequestTimeoutException(mailError));

      expect(mockMailService.sendUserWelcome).toHaveBeenCalledWith(newUser);
    });
  });

  describe('login', () => {
    it('should generate tokens and set them in cookies for a valid user', async () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');
      mockHashingProvider.encrypt.mockResolvedValue('hashedRefreshToken');
      mockUsersService.update.mockResolvedValue(mockUser);

      await service.login(mockUser, mockResponse as Response);

      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { userId: mockUser.id },
        {
          secret: mockAuthConfig.jwtAccessTokenSecret,
          expiresIn: '86400000ms',
        },
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { userId: mockUser.id },
        {
          secret: mockAuthConfig.jwtRefreshTokenSecret,
          expiresIn: '604800000ms',
        },
      );
      expect(mockHashingProvider.encrypt).toHaveBeenCalledWith('refresh-token');
      expect(mockUsersService.update).toHaveBeenCalledWith(mockUser.id, {
        refreshToken: 'hashedRefreshToken',
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Authentication',
        'access-token',
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Refresh',
        'refresh-token',
        expect.any(Object),
      );
    });
  });

  describe('logout', () => {
    it('should clear the refresh token in the database and clear cookies', async () => {
      mockUsersService.update.mockResolvedValue(mockUser);

      await service.logout(mockUser, mockResponse as Response);

      expect(mockUsersService.update).toHaveBeenCalledWith(mockUser.id, {
        refreshToken: null,
      });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('Refresh');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('Authentication');
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should return user entity if credentials are valid', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockHashingProvider.compareValueWithHash.mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(email);
      expect(mockHashingProvider.compareValueWithHash).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockHashingProvider.compareValueWithHash.mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedException('Credentials are not valid.'),
      );

      expect(mockUsersService.findOne).toHaveBeenCalledWith(email);
      expect(mockHashingProvider.compareValueWithHash).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new Error('User not found'));

      await expect(service.validateUser(email, password)).rejects.toThrow(
        new UnauthorizedException('Credentials are not valid.'),
      );

      expect(mockUsersService.findOne).toHaveBeenCalledWith(email);
      expect(mockHashingProvider.compareValueWithHash).not.toHaveBeenCalled();
    });
  });

  describe('verifyUserRefreshToken', () => {
    const refreshToken = 'refresh-token';
    const userId = '1';

    it('should return user if refresh token is valid', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockHashingProvider.compareValueWithHash.mockResolvedValue(true);

      const result = await service.verifyUserRefreshToken(refreshToken, userId);

      expect(mockUsersService.findOneById).toHaveBeenCalledWith(userId);
      expect(mockHashingProvider.compareValueWithHash).toHaveBeenCalledWith(
        refreshToken,
        mockUser.refreshToken,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if refresh token does not match the stored hash', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUser);
      mockHashingProvider.compareValueWithHash.mockResolvedValue(false);

      await expect(
        service.verifyUserRefreshToken(refreshToken, userId),
      ).rejects.toThrow(
        new UnauthorizedException('Refresh token is not valid.'),
      );

      expect(mockUsersService.findOneById).toHaveBeenCalledWith(userId);
      expect(mockHashingProvider.compareValueWithHash).toHaveBeenCalledWith(
        refreshToken,
        mockUser.refreshToken,
      );
    });

    it('should throw UnauthorizedException if the user associated with the token is not found', async () => {
      mockUsersService.findOneById.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(
        service.verifyUserRefreshToken(refreshToken, userId),
      ).rejects.toThrow(
        new UnauthorizedException('Refresh token is not valid.'),
      );

      expect(mockUsersService.findOneById).toHaveBeenCalledWith(userId);
      expect(mockHashingProvider.compareValueWithHash).not.toHaveBeenCalled();
    });
  });
});
