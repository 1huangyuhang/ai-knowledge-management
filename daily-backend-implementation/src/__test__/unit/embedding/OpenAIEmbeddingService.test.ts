import { OpenAIEmbeddingService } from '../../../infrastructure/ai/embedding/OpenAIEmbeddingService';
import { APICaller } from '../../../infrastructure/ai/api/APICaller';

// 模拟 APICaller
class MockAPICaller implements APICaller {
  post<T>(options: any): Promise<T> {
    // 这里我们将模拟 API 调用，直接返回预设的响应
    return Promise.resolve({
      data: {
        data: [
          { embedding: [0.1, 0.2, 0.3, 0.4, 0.5], index: 0 },
          { embedding: [0.6, 0.7, 0.8, 0.9, 1.0], index: 1 }
        ]
      }
    } as unknown as T);
  }

  get<T>(options: any): Promise<T> {
    throw new Error('Method not implemented.');
  }

  put<T>(options: any): Promise<T> {
    throw new Error('Method not implemented.');
  }

  delete<T>(options: any): Promise<T> {
    throw new Error('Method not implemented.');
  }
}

describe('OpenAIEmbeddingService', () => {
  let embeddingService: OpenAIEmbeddingService;
  let mockAPICaller: MockAPICaller;
  
  beforeEach(() => {
    mockAPICaller = new MockAPICaller();
    
    // 创建服务实例
    embeddingService = new OpenAIEmbeddingService(mockAPICaller, {
      apiKey: 'test-api-key',
      model: 'text-embedding-ada-002',
      baseUrl: 'https://api.openai.com/v1'
    });
  });
  
  describe('embedText', () => {
    it('should generate embedding for single text', async () => {
      // 执行测试
      const embedding = await embeddingService.embedText('test text');
      
      // 验证结果
      expect(embedding.vector).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
      expect(embedding.metadata).toBeDefined();
      expect(embedding.metadata.index).toBe(0);
    });
  });
  
  describe('embedTexts', () => {
    it('should generate embeddings for multiple texts', async () => {
      // 执行测试
      const embeddings = await embeddingService.embedTexts(['text 1', 'text 2']);
      
      // 验证结果
      expect(embeddings).toHaveLength(2);
      expect(embeddings[0].vector).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
      expect(embeddings[1].vector).toEqual([0.6, 0.7, 0.8, 0.9, 1.0]);
      expect(embeddings[0].metadata.index).toBe(0);
      expect(embeddings[1].metadata.index).toBe(1);
    });
  });
});
