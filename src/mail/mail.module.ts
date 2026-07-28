import { Global, Module } from '@nestjs/common';
import { MailService } from './provider/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { buildMailerOptions } from './mail-options.factory';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        buildMailerOptions(configService.getMailConfig()),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
