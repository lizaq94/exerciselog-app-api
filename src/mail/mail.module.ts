import { Global, Module } from '@nestjs/common';
import { MailService } from './provider/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const mailConfig = configService.getMailConfig();
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
          default: {
            from: `Exercise log app <no-reply@exerciselog.com>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new EjsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
