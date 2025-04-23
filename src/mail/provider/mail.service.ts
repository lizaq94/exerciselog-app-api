import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  public async sendUserWelcome(user: UserEntity) {
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Welcome to Exerciselog app!',
      template: './welcome',
      context: {
        name: user.username,
        email: user.email,
        loginUrl: `http://localhost:3000/auth/login`,
      },
    });
  }
}
