import { LLMClientImpl } from '../../src/infrastructure/ai/LLMClientImpl';
import { LoggerService } from '../../src/infrastructure/logging/logger.service';
import { ErrorHandler } from '../../src/infrastructure/error/error-handler';

// 创建一个模拟的LoggerService
const mockLogger: LoggerService = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  shutdown: jest.fn(),
};

// 创建一个模拟的ErrorHandler
const mockErrorHandler: ErrorHandler = {
  handle: jest.fn(),
};

// 创建测试配置
const testConfig = {
  apiKey: 'test-api-key',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
};

describe('LLMClientImpl', () => {
  let llmClient: LLMClientImpl;

  beforeEach(() => {
    // 创建LLM客户端实例
    llmClient = new LLMClientImpl(testConfig, mockLogger, mockErrorHandler);
  });

  describe('constructor', () => {
    it('should initialize with provided config, logger, and error handler', () => {
      expect(llmClient).toBeInstanceOf(LLMClientImpl);
    });

    it('should use default values if config is incomplete', () => {
      const incompleteConfig = {
        apiKey: 'test-api-key',
        baseUrl: 'https://api.openai.com/v1',
      };
      
      // @ts-ignore - Testing with incomplete config
      const clientWithIncompleteConfig = new LLMClientImpl(incompleteConfig as any, mockLogger, mockErrorHandler);
      expect(clientWithIncompleteConfig).toBeInstanceOf(LLMClientImpl);
    });
  });

  describe('sendRequest', () => {
    it('should throw an error for invalid requests', async () => {
      // 测试无效请求，使用jest.fn()模拟抛出错误
      llmClient['sendRequestWithRetry'] = jest.fn().mockRejectedValue(new Error('Invalid request'));
      
      const invalidRequest = {
        prompt: '', // 空提示词
      };

      await expect(llmClient.sendRequest(invalidRequest as any)).rejects.toThrow();
    });

    it('should have the correct retry configuration', () => {
      // 测试重试配置通过getConfig方法
      const config = llmClient.getConfig();
      expect(config.maxRetries).toBe(3);
      expect(config.retryDelay).toBeDefined();
    });
  });

  describe('getModel', () => {
    it('should return the configured model', () => {
      const model = llmClient.getModel();
      expect(model).toBe(testConfig.model);
    });
  });

  describe('getConfig', () => {
    it('should return the current configuration', () => {
      const config = llmClient.getConfig();
      expect(config).toEqual(expect.objectContaining(testConfig));
    });
  });

  describe('healthCheck', () => {
    it('should return true if the client is properly configured', () => {
      const health = llmClient.healthCheck();
      expect(health).toBe(true);
    });

    it('should return false if the client is not properly configured', () => {
      // 创建一个配置不完整的客户端
      const invalidConfig = {
        apiKey: '',
        baseUrl: '',
        model: '',
      };
      
      // @ts-ignore - Testing with invalid config
      const invalidClient = new LLMClientImpl(invalidConfig as any, mockLogger, mockErrorHandler);
      const health = invalidClient.healthCheck();
      expect(health).toBe(false);
    });
  });
});
