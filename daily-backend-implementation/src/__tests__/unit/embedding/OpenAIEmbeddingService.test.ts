import { OpenAIEmbeddingService } from '../../../infrastructure/ai/embedding/OpenAIEmbeddingService';
import { APICaller } from '../../../infrastructure/ai/api/APICaller';

// 模拟API调用器
const mockAPICaller: jest.Mocked<APICaller> = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// 测试配置
const testConfig = {
  apiKey: 'test-api-key',
  model: 'text-embedding-ada-002',
  baseUrl: 'https://api.openai.com/v1',
};

describe('OpenAIEmbeddingService', () => {
  let embeddingService: OpenAIEmbeddingService;

  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 创建嵌入服务实例
    embeddingService = new OpenAIEmbeddingService(mockAPICaller, testConfig);
  });

  describe('embedText', () => {
    it('should call embedTexts with single text', async () => {
      // 准备模拟响应
      const mockResponse = {
        data: {
          data: [
            {
              embedding: [0.1, 0.2, 0.3],
              index: 0,
            },
          ],
        },
      };
      
      mockAPICaller.post.mockResolvedValue(mockResponse as any);
      
      // 调用方法
      const result = await embeddingService.embedText('test text');
      
      // 验证结果
      expect(result).toEqual({
        vector: [0.1, 0.2, 0.3],
        metadata: {
          index: 0,
        },
      });
      
      // 验证API调用
      expect(mockAPICaller.post).toHaveBeenCalledTimes(1);
      expect(mockAPICaller.post).toHaveBeenCalledWith({
        url: `${testConfig.baseUrl}/embeddings`,
        headers: {
          'Authorization': `Bearer ${testConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        data: {
          model: testConfig.model,
          input: ['test text'],
        },
      });
    });
  });

  describe('embedTexts', () => {
    it('should generate embeddings for multiple texts', async () => {
      // 准备模拟响应
      const mockResponse = {
        data: {
          data: [
            {
              embedding: [0.1, 0.2, 0.3],
              index: 0,
            },
            {
              embedding: [0.4, 0.5, 0.6],
              index: 1,
            },
          ],
        },
      };
      
      mockAPICaller.post.mockResolvedValue(mockResponse as any);
      
      // 调用方法
      const texts = ['text 1', 'text 2'];
      const result = await embeddingService.embedTexts(texts);
      
      // 验证结果
      expect(result).toEqual([
        {
          vector: [0.1, 0.2, 0.3],
          metadata: {
            index: 0,
          },
        },
        {
          vector: [0.4, 0.5, 0.6],
          metadata: {
            index: 1,
          },
        },
      ]);
      
      // 验证API调用
      expect(mockAPICaller.post).toHaveBeenCalledTimes(1);
      expect(mockAPICaller.post).toHaveBeenCalledWith({
        url: `${testConfig.baseUrl}/embeddings`,
        headers: {
          'Authorization': `Bearer ${testConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        data: {
          model: testConfig.model,
          input: texts,
        },
      });
    });

    it('should handle API errors', async () => {
      // 准备模拟错误
      const mockError = new Error('API Error');
      mockAPICaller.post.mockRejectedValue(mockError);
      
      // 调用方法并验证错误
      await expect(embeddingService.embedTexts(['test text'])).rejects.toThrow('Failed to generate embeddings: API Error');
    });

    it('should handle empty texts array', async () => {
      // 准备模拟响应
      const mockResponse = {
        data: {
          data: [],
        },
      };
      
      mockAPICaller.post.mockResolvedValue(mockResponse as any);
      
      // 调用方法
      const result = await embeddingService.embedTexts([]);
      
      // 验证结果
      expect(result).toEqual([]);
      
      // 验证API调用
      expect(mockAPICaller.post).toHaveBeenCalledTimes(1);
    });
  });
});
