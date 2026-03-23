import { PinoLoggerService } from '../pino-logger.service';
import { LoggerService } from '../logger.service';
import { ThoughtFragmentCreatedEvent } from '../../../domain/events/thought-fragment-events';
import { TestDataGenerator } from '../../../__test__/test-data-generator';

describe('Logger Integration Tests', () => {
  let logger: LoggerService;

  beforeEach(() => {
    // 直接测试LoggerService接口，不依赖具体实现的输出方式
    logger = new PinoLoggerService({ level: 'debug', prettyPrint: false });
  });

  test('should log info messages without throwing errors', async () => {
    // Arrange
    const message = 'Test info message';
    
    // Act & Assert
    expect(() => logger.info(message, { context: 'test' })).not.toThrow();
  });

  test('should log error messages without throwing errors', async () => {
    // Arrange
    const error = new Error('Test error');
    
    // Act & Assert
    expect(() => logger.error('Test error message', { error, context: 'test' })).not.toThrow();
  });

  test('should log debug messages without throwing errors', async () => {
    // Arrange
    const message = 'Test debug message';
    
    // Act & Assert
    expect(() => logger.debug(message, { context: 'test' })).not.toThrow();
  });

  test('should log warning messages without throwing errors', async () => {
    // Arrange
    const message = 'Test warning message';
    
    // Act & Assert
    expect(() => logger.warn(message, { context: 'test' })).not.toThrow();
  });

  test('should log fatal messages without throwing errors', async () => {
    // Arrange
    const message = 'Test fatal message';
    const error = new Error('Test fatal error');
    
    // Act & Assert
    expect(() => logger.fatal(message, error, { context: 'test' })).not.toThrow();
  });
});