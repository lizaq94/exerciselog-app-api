import { Test, TestingModule } from '@nestjs/testing';
import * as os from 'os';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;
  let superLogSpy: jest.SpyInstance;
  let superWarnSpy: jest.SpyInstance;
  let superErrorSpy: jest.SpyInstance;
  const originalNodeEnv = process.env.NODE_ENV;

  const buildService = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();
    return module.get<LoggerService>(LoggerService);
  };

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  describe('in production (NODE_ENV=production)', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      service = await buildService();
    });

    it('emits valid JSONL on stdout for log()', () => {
      service.log('Test message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stderrSpy).not.toHaveBeenCalled();

      const raw = stdoutSpy.mock.calls[0][0] as string;
      expect(raw.endsWith('\n')).toBe(true);
      expect(() => JSON.parse(raw)).not.toThrow();

      const parsed = JSON.parse(raw);
      expect(parsed).toMatchObject({
        level: 'log',
        context: 'TestContext',
        message: 'Test message',
        service: 'exerciselog-api',
        pid: process.pid,
        hostname: os.hostname(),
      });
      expect(parsed.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('emits valid JSONL on stdout for warn()', () => {
      service.warn('Heads up', 'WarnContext');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stderrSpy).not.toHaveBeenCalled();

      const parsed = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe('Heads up');
      expect(parsed.context).toBe('WarnContext');
    });

    it('emits valid JSONL on stderr for error() with string message', () => {
      service.error('Boom', 'ErrorContext');

      expect(stderrSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy).not.toHaveBeenCalled();

      const parsed = JSON.parse(stderrSpy.mock.calls[0][0] as string);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Boom');
      expect(parsed.context).toBe('ErrorContext');
      expect(parsed.stack).toBeUndefined();
    });

    it('preserves object messages without double-stringifying', () => {
      const payload = { error: 'oops', code: 500 };

      service.error(payload, 'ErrorContext');

      const parsed = JSON.parse(stderrSpy.mock.calls[0][0] as string);
      expect(parsed.message).toEqual(payload);
    });

    it('extracts message and stack from Error instances', () => {
      const err = new Error('Database down');

      service.error(err, 'DbContext');

      const parsed = JSON.parse(stderrSpy.mock.calls[0][0] as string);
      expect(parsed.message).toBe('Database down');
      expect(typeof parsed.stack).toBe('string');
      expect(parsed.stack).toContain('Error: Database down');
    });

    it('serializes undefined message as the string "undefined"', () => {
      service.error(undefined, 'ErrorContext');

      const parsed = JSON.parse(stderrSpy.mock.calls[0][0] as string);
      expect(parsed.message).toBe('undefined');
    });

    it('omits context field when not provided', () => {
      service.log('no context');

      const parsed = JSON.parse(stdoutSpy.mock.calls[0][0] as string);
      expect(parsed.context).toBeUndefined();
    });

    it('does not delegate to ConsoleLogger super methods', () => {
      superLogSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'log')
        .mockImplementation();
      superErrorSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'error')
        .mockImplementation();

      service.log('msg', 'Ctx');
      service.error('err', 'Ctx');

      expect(superLogSpy).not.toHaveBeenCalled();
      expect(superErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('in development (NODE_ENV !== production)', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      service = await buildService();

      superLogSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'log')
        .mockImplementation();
      superWarnSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'warn')
        .mockImplementation();
      superErrorSpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'error')
        .mockImplementation();
    });

    it('delegates log() to ConsoleLogger and does not emit JSON', () => {
      service.log('dev message', 'DevContext');

      expect(superLogSpy).toHaveBeenCalledWith('dev message', 'DevContext');
      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('delegates warn() to ConsoleLogger and does not emit JSON', () => {
      service.warn('dev warning', 'DevContext');

      expect(superWarnSpy).toHaveBeenCalledWith('dev warning', 'DevContext');
      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('delegates error() to ConsoleLogger and does not emit JSON', () => {
      service.error('dev error', 'DevContext');

      expect(superErrorSpy).toHaveBeenCalledWith('dev error', 'DevContext');
      expect(stdoutSpy).not.toHaveBeenCalled();
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });
});
