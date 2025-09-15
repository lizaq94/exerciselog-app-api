import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private logLevel: string;

  constructor() {
    super();
    this.logLevel = process.env.LOG_LEVEL || 'log';
  }

  public log(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    this.logToFile(entry);
    if (this.shouldLog('log')) {
      super.log(message, context);
    }
  }

  public error(message: any, stackOrContext?: string) {
    const logMessage =
      message && typeof message === 'object'
        ? JSON.stringify(message, null, 2)
        : String(message);
    const entry = `${stackOrContext}\t${logMessage}`;
    this.logToFile(entry, 'ERROR');
    if (this.shouldLog('error')) {
      super.error(message, stackOrContext);
    }
  }

  public warn(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    this.logToFile(entry, 'WARN');
    if (this.shouldLog('warn')) {
      super.warn(message, context);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'log', 'debug', 'verbose'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private async logToFile(
    entry: string,
    level: 'INFO' | 'WARN' | 'ERROR' = 'INFO',
  ) {
    const now = new Date();

    const formattedDate = Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
      timeZone: 'Europe/Warsaw',
    })
      .format(now)
      .replace(/\//g, '-');

    const formattedEntry = `${Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Warsaw',
    }).format(now)}\t[${level}]\t${entry}\n`;

    try {
      const logsDir = path.join(__dirname, '..', '..', 'logs');
      if (!fs.existsSync(logsDir)) {
        await fsPromises.mkdir(logsDir);
      }

      const logFileName = `log-${formattedDate}.log`;
      const logFilePath = path.join(logsDir, logFileName);

      await fsPromises.appendFile(logFilePath, formattedEntry);
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  }
}
