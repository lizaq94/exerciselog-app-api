import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

// Configuration interfaces
interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  version: string;
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

interface AwsConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBucketName: string;
  cloudFrontUrl: string;
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
      databaseUrl: this.get<string>(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/exerciselog',
      ),
      version: this.get<string>('APP_VERSION', '1.0.0'),
    };
  }

  /**
   * Gets authentication-related configuration
   */
  getAuthConfig(): AuthConfig {
    return {
      jwtAccessTokenSecret: this.get<string>(
        'JWT_ACCESS_TOKEN_SECRET',
        'supersecretkey_for_development_only',
      ),
      jwtAccessTokenExpiration: this.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
        '86400000',
      ),
      jwtRefreshTokenSecret: this.get<string>(
        'JWT_REFRESH_TOKEN_SECRET',
        'supersecretrefreshkey_for_development_only',
      ),
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
   * Gets AWS configuration
   */
  getAwsConfig(): AwsConfig {
    return {
      region: this.get<string>('AWS_REGION', 'eu-central-1'),
      accessKeyId: this.get<string>('AWS_ACCESS_KEY_ID', ''),
      secretAccessKey: this.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      publicBucketName: this.get<string>('AWS_PUBLIC_BUCKET_NAME', ''),
      cloudFrontUrl: this.get<string>('AWS_CLOUDFRONT_URL', ''),
    };
  }
}
