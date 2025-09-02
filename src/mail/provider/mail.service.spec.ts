import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { UserEntity } from '../../users/entities/user.entity';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;
  let testUser: UserEntity;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);

    testUser = new UserEntity();
    testUser.id = 'user-1';
    testUser.username = 'john_doe';
    testUser.email = 'john.doe@example.com';
    testUser.password = 'hashedPassword';
    testUser.refreshToken = 'refreshToken';
    testUser.createdAt = new Date();
    testUser.updatedAt = new Date();

    jest.clearAllMocks();
  });

  describe('sendUserWelcome', () => {
    it('should call mailerService.sendMail with correct parameters', async () => {
      mockMailerService.sendMail.mockResolvedValue(undefined);

      await service.sendUserWelcome(testUser);

      expect(mailerService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'john.doe@example.com',
        subject: 'Welcome to Exerciselog app!',
        template: './welcome',
        context: {
          name: 'john_doe',
          email: 'john.doe@example.com',
          loginUrl: 'http://localhost:3000/auth/login',
        },
      });
    });
  });
});
