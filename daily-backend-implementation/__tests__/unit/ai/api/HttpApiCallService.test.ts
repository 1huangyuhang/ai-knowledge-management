import { HttpApiCallService } from '../../../../src/infrastructure/ai/api/HttpApiCallService';
import { LLMRequest } from '../../../../src/application/services/llm/LLMClient';
import { LoggerService } from '../../../../src/infrastructure/logging/logger.service';

// 模拟LoggerService
class MockLoggerService implements LoggerService {
  debug(message: string, metadata?: any): void {
    console.log(`DEBUG: ${message}`, metadata);
  }
  
  info(message: string, metadata?: any): void {
    console.log(`INFO: ${message}`, metadata);
  }
  
  warn(message: string, metadata?: any): void {
    console.log(`WARN: ${message}`, metadata);
  }
  
  error(message: string, metadata?: any): void {
    console.log(`ERROR: ${message}`, metadata);
  }
  
  fatal(message: string, metadata?: any): void {
    console.log(`FATAL: ${message}`, metadata);
  }
}

describe('HttpApiCallService', () => {
  let apiCallService: HttpApiCallService;
  let loggerService: LoggerService;
  
  beforeEach(() => {
    loggerService = new MockLoggerService();
    apiCallService = new HttpApiCallService(
      'https://api.openai.com/v1',
      'test-api-key',
      loggerService
    );
  });
  
  describe('checkServiceHealth', () => {
    it('should return false when API is unreachable', async () => {
      // 由于是测试环境，API 可能无法访问，所以预期返回 false
      const result = await apiCallService.checkServiceHealth();
      expect(result).toBe(false);
    });
  });
  
  describe('sendRequest', () => {
    it('should throw error when API key is invalid', async () => {
      const request: LLMRequest = {
        prompt: 'Hello',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 100,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stream: false
      };
      
      await expect(apiCallService.sendRequest(request)).rejects.toThrow();
    });
  });
  
  describe('sendRequestWithTimeout', () => {
    it('should throw timeout error when request takes too long', async () => {
      const request: LLMRequest = {
        prompt: 'Hello',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 100,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        stream: false
      };
      
      await expect(apiCallService.sendRequestWithTimeout(request, 100))
        .rejects.toThrow();
    });
  });
});
