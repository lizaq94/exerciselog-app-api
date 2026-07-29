import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}`, quiet: true });
config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DIRECT_URL as string,
  },
});
