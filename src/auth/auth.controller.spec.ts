import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerService } from '../logger/logger.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockLoggerService: jest.Mocked<LoggerService>;
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

  beforeEach(async () => {
    const mockAuthServiceFactory = () => ({
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
    });

    const mockLoggerServiceFactory = () => ({
      log: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: mockAuthServiceFactory,
        },
        {
          provide: LoggerService,
          useFactory: mockLoggerServiceFactory,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    mockAuthService = module.get(AuthService);
    mockLoggerService = module.get(LoggerService);

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return user data when login is successful', async () => {
      mockAuthService.login.mockResolvedValue(undefined);

      const result = await controller.login(mockUser, mockResponse as Response);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `User login attempt: ${mockUser.id}`,
        AuthController.name,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockUser,
        mockResponse,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('signUp', () => {
    it('should call authService.signup with correct DTO and return newly created user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'securepassword',
      };
      mockAuthService.signup.mockResolvedValue(undefined);

      const result = await controller.signUp(
        createUserDto,
        mockResponse as Response,
      );

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'User registration attempt',
        AuthController.name,
      );
      expect(mockAuthService.signup).toHaveBeenCalledWith(
        createUserDto,
        mockResponse,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('refreshToken', () => {
    it('should call authService.login to issue a new token for an authenticated user', async () => {
      mockAuthService.login.mockResolvedValue(undefined);

      const result = await controller.refreshToken(
        mockUser,
        mockResponse as Response,
      );

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `Refreshing access token for user: ${mockUser.id}`,
        AuthController.name,
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockUser,
        mockResponse,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return 204 No Content', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(
        mockUser,
        mockResponse as Response,
      );

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        `User logout: ${mockUser.id}`,
        AuthController.name,
      );
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        mockUser,
        mockResponse,
      );
      expect(result).toBeUndefined();
    });
  });
});
