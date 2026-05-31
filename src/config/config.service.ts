import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

// Configuration interfaces
interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  version: string;
  corsOrigin: string;
}

interface AuthConfig {
  jwtAccessTokenSecret: string;
  jwtAccessTokenExpiration: string;
  jwtRefreshTokenSecret: string;
  jwtRefreshTokenExpiration: string;
}

interface MailConfig {
  host: string;
  username: string;
  password: string;
  from: string;
}

interface StorageConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

interface AiConfig {
  openRouterApiKey: string;
  openRouterApiUrl: string;
}

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  /**
   * Gets an environment variable value with type specification
   * @param key environment variable key
   * @param defaultValue default value if the variable doesn't exist
   */
  get<T>(key: string, defaultValue?: T): T {
    return this.configService.get<T>(key, defaultValue);
  }

  /**
   * Gets application configuration
   */
  getAppConfig(): AppConfig {
    return {
      nodeEnv: this.get<string>('NODE_ENV', 'development'),
      port: this.get<number>('PORT', 3000),
      databaseUrl: this.get<string>('DATABASE_URL'),
      version: this.get<string>('APP_VERSION', '1.0.0'),
      corsOrigin: this.get<string>('CORS_ORIGIN'),
    };
  }

  /**
   * Gets authentication-related configuration
   */
  getAuthConfig(): AuthConfig {
    return {
      jwtAccessTokenSecret: this.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      jwtAccessTokenExpiration: this.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        '900000',
      ),
      jwtRefreshTokenSecret: this.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      jwtRefreshTokenExpiration: this.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
        '604800000',
      ),
    };
  }

  /**
   * Gets mail configuration
   */
  getMailConfig(): MailConfig {
    return {
      host: this.get<string>('MAIL_HOST', 'smtp.example.com'),
      username: this.get<string>('SMTP_USERNAME', 'user@example.com'),
      password: this.get<string>('SMTP_PASSWORD', 'password'),
      from: this.get<string>('MAIL_FROM', 'no-reply@exerciselog.com'),
    };
  }

  /**
   * Gets object storage configuration (S3-compatible: Cloudflare R2, MinIO, AWS S3, ...)
   */
  getStorageConfig(): StorageConfig {
    return {
      endpoint: this.get<string>('S3_ENDPOINT', ''),
      region: this.get<string>('S3_REGION', 'auto'),
      accessKeyId: this.get<string>('S3_ACCESS_KEY_ID', ''),
      secretAccessKey: this.get<string>('S3_SECRET_ACCESS_KEY', ''),
      bucketName: this.get<string>('S3_BUCKET_NAME', ''),
      publicUrl: this.get<string>('S3_PUBLIC_URL', ''),
    };
  }

  /**
   * Gets OpenRouter configuration
   */
  getAiConfig(): AiConfig {
    return {
      openRouterApiKey: this.get<string>('OPEN_ROUTER_API_KEY', ''),
      openRouterApiUrl: this.get<string>('OPEN_ROUTER_API_URL', ''),
    };
  }
}

export default ConfigService;
