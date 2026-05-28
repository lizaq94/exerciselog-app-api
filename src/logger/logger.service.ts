import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as os from 'os';

type LogLevel = 'log' | 'warn' | 'error';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  context?: string;
  message: unknown;
  service: string;
  pid: number;
  hostname: string;
  stack?: string;
}

@Injectable()
export class LoggerService extends ConsoleLogger {
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly hostname = os.hostname();
  private readonly service = 'exerciselog-api';

  public log(message: any, context?: string) {
    if (this.isProduction) {
      this.emit('log', message, context);
      return;
    }
    super.log(message, context);
  }

  public warn(message: any, context?: string) {
    if (this.isProduction) {
      this.emit('warn', message, context);
      return;
    }
    super.warn(message, context);
  }

  public error(message: any, stackOrContext?: string) {
    if (this.isProduction) {
      this.emit('error', message, stackOrContext);
      return;
    }
    super.error(message, stackOrContext);
  }

  private emit(level: LogLevel, message: unknown, context?: string) {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message: this.normalizeMessage(message),
      service: this.service,
      pid: process.pid,
      hostname: this.hostname,
    };

    if (message instanceof Error && message.stack) {
      payload.stack = message.stack;
    }

    const line = JSON.stringify(payload) + '\n';
    const stream = level === 'error' ? process.stderr : process.stdout;
    stream.write(line);
  }

  private normalizeMessage(message: unknown): unknown {
    if (message instanceof Error) {
      return message.message;
    }
    if (message === undefined) {
      return 'undefined';
    }
    return message;
  }
}
