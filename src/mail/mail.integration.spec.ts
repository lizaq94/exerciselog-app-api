import { Test, TestingModule } from '@nestjs/testing';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './provider/mail.service';
import { buildMailerOptions } from './mail-options.factory';
import { UserEntity } from '../users/entities/user.entity';

describe('MailService (integration, jsonTransport)', () => {
  let service: MailService;

  const mailConfig = {
    enabled: true,
    host: 'smtp.invalid',
    username: 'user',
    password: 'pass',
    from: 'no-reply@exerciselog.com',
  };

  const user = {
    username: 'Kamil',
    email: 'kamil@example.com',
  } as UserEntity;

  beforeAll(async () => {
    const options = buildMailerOptions(mailConfig);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MailerModule.forRoot({
          ...options,
          transport: { jsonTransport: true },
        }),
      ],
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('renders the welcome template and builds a complete message', async () => {
    const info = await service.sendUserWelcome(user);
    const message = JSON.parse(info.message);

    expect(message.from).toEqual({
      address: 'no-reply@exerciselog.com',
      name: 'Exercise log app',
    });
    expect(message.to).toEqual([{ address: user.email, name: '' }]);
    expect(message.subject).toBe('Welcome to Exerciselog app!');
    expect(message.html).toContain(user.username);
    expect(message.html).toContain(user.email);
    expect(message.html).not.toContain('<%=');
  });
});
