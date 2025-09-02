import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  promises: {
    mkdir: jest.fn(),
    appendFile: jest.fn(),
  },
}));

describe('LoggerService', () => {
  let service: LoggerService;
  let mockExistsSync: jest.MockedFunction<typeof fs.existsSync>;
  let mockMkdir: jest.MockedFunction<typeof fsPromises.mkdir>;
  let mockAppendFile: jest.MockedFunction<typeof fsPromises.appendFile>;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);

    mockExistsSync = jest.mocked(fs.existsSync);
    mockMkdir = jest.mocked(fsPromises.mkdir);
    mockAppendFile = jest.mocked(fsPromises.appendFile);

    consoleSpy = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'log')
      .mockImplementation();
    consoleErrorSpy = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(service)), 'error')
      .mockImplementation();

    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should call logToFile with formatted entry and call super.log', () => {
      const logToFileSpy = jest
        .spyOn(service as any, 'logToFile')
        .mockImplementation();
      const message = 'Test message';
      const context = 'TestContext';

      service.log(message, context);

      expect(logToFileSpy).toHaveBeenCalledWith('TestContext\tTest message');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test message'),
        expect.stringContaining('TestContext'),
      );
    });

    it('should call logToFile without context when context is not provided', () => {
      const logToFileSpy = jest
        .spyOn(service as any, 'logToFile')
        .mockImplementation();
      const message = 'Test message';

      service.log(message);

      expect(logToFileSpy).toHaveBeenCalledWith('undefined\tTest message');
    });
  });

  describe('error', () => {
    it('should call logToFile with ERROR level and call super.error when message is string', () => {
      const logToFileSpy = jest
        .spyOn(service as any, 'logToFile')
        .mockImplementation();
      const message = 'Error message';
      const context = 'ErrorContext';

      service.error(message, context);

      expect(logToFileSpy).toHaveBeenCalledWith(
        'ErrorContext\tError message',
        'ERROR',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error message'),
        expect.stringContaining('ErrorContext'),
      );
    });

    it('should stringify object message and call logToFile with ERROR level', () => {
      const logToFileSpy = jest
        .spyOn(service as any, 'logToFile')
        .mockImplementation();
      const message = { error: 'test error', code: 500 };
      const context = 'ErrorContext';

      service.error(message, context);

      const expectedStringifiedMessage = JSON.stringify(message, null, 2);
      expect(logToFileSpy).toHaveBeenCalledWith(
        `ErrorContext\t${expectedStringifiedMessage}`,
        'ERROR',
      );
    });

    it('should handle undefined message by converting to string', () => {
      const logToFileSpy = jest
        .spyOn(service as any, 'logToFile')
        .mockImplementation();

      service.error(undefined, 'ErrorContext');

      expect(logToFileSpy).toHaveBeenCalledWith(
        'ErrorContext\tundefined',
        'ERROR',
      );
    });
  });

  describe('logToFile', () => {
    it('should create the logs directory if it does not exist', async () => {
      mockExistsSync.mockReturnValue(false);
      mockMkdir.mockResolvedValue(undefined);
      mockAppendFile.mockResolvedValue(undefined);

      await (service as any).logToFile('Test entry', 'INFO');

      const expectedLogsDir = path.join(__dirname, '..', '..', 'logs');
      expect(mockExistsSync).toHaveBeenCalledWith(expectedLogsDir);
      expect(mockMkdir).toHaveBeenCalledWith(expectedLogsDir);
    });

    it('should not create logs directory if it already exists', async () => {
      mockExistsSync.mockReturnValue(true);
      mockAppendFile.mockResolvedValue(undefined);

      await (service as any).logToFile('Test entry', 'INFO');

      expect(mockMkdir).not.toHaveBeenCalled();
    });

    it('should append a correctly formatted log entry to the correct log file', async () => {
      mockExistsSync.mockReturnValue(true);
      mockAppendFile.mockResolvedValue(undefined);

      const mockDate = new Date('2023-12-25T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      await (service as any).logToFile('Test entry', 'INFO');

      const expectedLogsDir = path.join(__dirname, '..', '..', 'logs');
      const expectedLogFileName = 'log-25-12-2023.log';
      const expectedLogFilePath = path.join(
        expectedLogsDir,
        expectedLogFileName,
      );
      const expectedFormattedEntry = '25/12/2023, 11:30\t[INFO]\tTest entry\n';

      expect(mockAppendFile).toHaveBeenCalledWith(
        expectedLogFilePath,
        expectedFormattedEntry,
      );

      (global.Date as any).mockRestore();
    });

    it('should use ERROR level when specified', async () => {
      mockExistsSync.mockReturnValue(true);
      mockAppendFile.mockResolvedValue(undefined);

      const mockDate = new Date('2023-12-25T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      await (service as any).logToFile('Error entry', 'ERROR');

      const expectedFormattedEntry =
        '25/12/2023, 11:30\t[ERROR]\tError entry\n';

      expect(mockAppendFile).toHaveBeenCalledWith(
        expect.any(String),
        expectedFormattedEntry,
      );

      (global.Date as any).mockRestore();
    });

    it('should use INFO level as default when level is not specified', async () => {
      mockExistsSync.mockReturnValue(true);
      mockAppendFile.mockResolvedValue(undefined);

      const mockDate = new Date('2023-12-25T10:30:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      await (service as any).logToFile('Default entry');

      const expectedFormattedEntry =
        '25/12/2023, 11:30\t[INFO]\tDefault entry\n';

      expect(mockAppendFile).toHaveBeenCalledWith(
        expect.any(String),
        expectedFormattedEntry,
      );

      (global.Date as any).mockRestore();
    });

    it('should handle file system errors gracefully when mkdir fails', async () => {
      const directConsoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();
      mockExistsSync.mockReturnValue(false);
      const mkdirError = new Error('Permission denied');
      mockMkdir.mockRejectedValue(mkdirError);

      await (service as any).logToFile('Test entry', 'INFO');

      expect(directConsoleSpy).toHaveBeenCalledWith('Permission denied');
      directConsoleSpy.mockRestore();
    });

    it('should handle file system errors gracefully when appendFile fails', async () => {
      const directConsoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();
      mockExistsSync.mockReturnValue(true);
      const appendFileError = new Error('Disk full');
      mockAppendFile.mockRejectedValue(appendFileError);

      await (service as any).logToFile('Test entry', 'INFO');

      expect(directConsoleSpy).toHaveBeenCalledWith('Disk full');
      directConsoleSpy.mockRestore();
    });

    it('should handle non-Error exceptions gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      mockAppendFile.mockRejectedValue('String error');

      await (service as any).logToFile('Test entry', 'INFO');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
