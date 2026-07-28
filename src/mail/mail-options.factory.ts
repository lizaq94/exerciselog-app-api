import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/adapters/ejs.adapter';
import { join } from 'path';
import { MailConfig } from '../config/config.service';

export function buildMailerOptions(mailConfig: MailConfig): MailerOptions {
  return {
    transport: {
      host: mailConfig.host,
      secure: false,
      port: 2525,
      auth: {
        user: mailConfig.username,
        pass: mailConfig.password,
      },
    },
    defaults: {
      from: `Exercise log app <${mailConfig.from}>`,
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new EjsAdapter(),
      options: {
        strict: false,
      },
    },
  };
}
