import { APICallerImpl } from '../../../src/infrastructure/ai/api/APICallerImpl';
import { LoggerService } from '../../../src/infrastructure/logging/logger.service';
import { ErrorHandler } from '../../../src/infrastructure/error/error-handler';

// 模拟LoggerService
class MockLoggerService implements LoggerService {
  info(message: string, metadata?: any): void {
    console.log(message, metadata);
  }

  error(message: string, metadata?: any): void {
    console.error(message, metadata);
  }

  warn(message: string, metadata?: any): void {
    console.warn(message, metadata);
  }

  debug(message: string, metadata?: any): void {
    console.debug(message, metadata);
  }

  trace(message: string, metadata?: any): void {
    console.trace(message, metadata);
  }
}

// 模拟ErrorHandler
class MockErrorHandler implements ErrorHandler {
  handle(error: any, context?: any): void {
    console.error('Error handled:', error, context);
  }
}

describe('APICallerImpl', () => {
  let apiCaller: APICallerImpl;
  let loggerService: MockLoggerService;
  let errorHandler: MockErrorHandler;

  beforeEach(() => {
    loggerService = new MockLoggerService();
    errorHandler = new MockErrorHandler();
    apiCaller = new APICallerImpl({}, loggerService, errorHandler);
  });

  describe('healthCheck', () => {
    it('should return true when api caller is healthy', () => {
      expect(apiCaller.healthCheck()).toBe(true);
    });
  });

  describe('getConfig', () => {
    it('should return the correct configuration', () => {
      const config = apiCaller.getConfig();
      expect(config).toEqual({
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 30000,
      });
    });

    it('should return custom configuration when provided', () => {
      const customConfig = {
        maxRetries: 5,
        retryDelay: 2000,
        timeout: 60000,
      };
      const customAPICaller = new APICallerImpl(customConfig, loggerService, errorHandler);
      expect(customAPICaller.getConfig()).toEqual(customConfig);
    });
  });

  describe('API methods', () => {
    it('should have all required API methods', () => {
      expect(apiCaller).toHaveProperty('call');
      expect(apiCaller).toHaveProperty('get');
      expect(apiCaller).toHaveProperty('post');
      expect(apiCaller).toHaveProperty('put');
      expect(apiCaller).toHaveProperty('delete');
      expect(apiCaller).toHaveProperty('getConfig');
      expect(apiCaller).toHaveProperty('healthCheck');
    });
  });

  // 注意：这里我们只测试了API调用器的基本结构和配置
  // 对于实际的HTTP请求测试，应该使用集成测试或模拟HTTP客户端
});
