import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import ConfigService from '../config/config.service';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService) {
    super({ adapter: new PrismaPg(configService.getAppConfig().databaseUrl) });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
