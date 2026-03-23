/**
 * 认知解析器服务测试
 */
import { CognitiveParserService, LLMBasedCognitiveParserService } from '../../../../application/ai/cognitive-parsing/CognitiveParserService';
import { LLMClient } from '../../../../application/services/llm/LLMClient';
import { PromptGenerationService } from '../../../../application/services/llm/prompt/PromptGenerationService';

// Mock dependencies
class MockLLMClient implements LLMClient {
  async generate(prompt: string, options?: any): Promise<string> {
    return JSON.stringify({
      concepts: [],
      relations: []
    });
  }

  async generateStructuredOutput<T>(prompt: string, options?: any): Promise<T> {
    return {
      concepts: [
        {
          semanticIdentity: 'Test Concept',
          abstractionLevel: 3,
          confidenceScore: 0.9,
          description: 'A test concept',
          metadata: {}
        }
      ],
      relations: []
    } as unknown as T;
  }
}

class MockPromptGenerationService implements PromptGenerationService {
  generateCognitiveParsingPrompt(text: string): string {
    return `Parse cognitive concepts from: ${text}`;
  }

  generatePrompt(templateName: string, data: any): string {
    return 'Generated prompt';
  }
}

describe('CognitiveParserService', () => {
  let mockLLMClient: LLMClient;
  let mockPromptService: PromptGenerationService;
  let cognitiveParserService: CognitiveParserService;

  beforeEach(() => {
    mockLLMClient = new MockLLMClient();
    mockPromptService = new MockPromptGenerationService();
    cognitiveParserService = new LLMBasedCognitiveParserService(mockLLMClient, mockPromptService);
  });

  describe('parse', () => {
    it('should return parsing result with concepts and relations', async () => {
      const text = 'Test text containing cognitive concepts';
      const modelId = 'test-model-id';

      const result = await cognitiveParserService.parse(text, modelId);

      expect(result).toHaveProperty('concepts');
      expect(result).toHaveProperty('relations');
      expect(Array.isArray(result.concepts)).toBe(true);
      expect(Array.isArray(result.relations)).toBe(true);
    });

    it('should handle empty text', async () => {
      const text = '';
      const modelId = 'test-model-id';

      const result = await cognitiveParserService.parse(text, modelId);

      expect(result).toHaveProperty('concepts');
      expect(result).toHaveProperty('relations');
      expect(result.concepts).toEqual([]);
      expect(result.relations).toEqual([]);
    });
  });

  describe('batchParse', () => {
    it('should return array of parsing results', async () => {
      const texts = ['Test text 1', 'Test text 2', 'Test text 3'];
      const modelId = 'test-model-id';

      const results = await cognitiveParserService.batchParse(texts, modelId);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(texts.length);
      results.forEach(result => {
        expect(result).toHaveProperty('concepts');
        expect(result).toHaveProperty('relations');
      });
    });

    it('should handle empty texts array', async () => {
      const texts: string[] = [];
      const modelId = 'test-model-id';

      const results = await cognitiveParserService.batchParse(texts, modelId);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });
});
