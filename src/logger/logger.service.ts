import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService extends ConsoleLogger {
  public log(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    this.logToFile(entry);
    super.log(message, context);
  }

  public error(message: any, stackOrContext?: string) {
    const logMessage =
      message && typeof message === 'object'
        ? JSON.stringify(message, null, 2)
        : String(message);
    const entry = `${stackOrContext}\t${logMessage}`;
    this.logToFile(entry, 'ERROR');
    super.error(message, stackOrContext);
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
