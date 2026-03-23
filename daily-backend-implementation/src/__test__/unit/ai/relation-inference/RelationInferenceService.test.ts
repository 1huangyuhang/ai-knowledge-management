/**
 * 关系推断服务测试
 */
import { RelationInferenceService, LLMBasedRelationInferenceService } from '../../../../application/ai/relation-inference/RelationInferenceService';
import { LLMClient } from '../../../../application/services/llm/LLMClient';
import { SimilaritySearchService } from '../../../../application/services/llm/embedding/SimilaritySearchService';
import { CognitiveConceptImpl } from '../../../../domain/entities';
import { CognitiveRelationType } from '../../../../domain/entities';

// Mock dependencies
class MockLLMClient implements LLMClient {
  async generate(prompt: string, options?: any): Promise<string> {
    return JSON.stringify({
      relationType: 'association',
      confidenceScore: 0.85,
      description: 'Test relation'
    });
  }

  async generateStructuredOutput<T>(prompt: string, options?: any): Promise<T> {
    return {
      relationType: CognitiveRelationType.ASSOCIATION,
      confidenceScore: 0.85,
      description: 'Test relation'
    } as unknown as T;
  }
}

class MockSimilaritySearchService implements SimilaritySearchService {
  async searchByEmbedding(embedding: number[], limit?: number): Promise<Array<{ vector: any; score: number }>> {
    return [];
  }

  async searchByContent(content: string, limit?: number): Promise<Array<{ vector: any; score: number }>> {
    return [];
  }

  async batchSearch(embeddings: number[][], limit?: number): Promise<Array<Array<{ vector: any; score: number }>>> {
    return [];
  }
}

describe('RelationInferenceService', () => {
  let mockLLMClient: LLMClient;
  let mockSimilarityService: SimilaritySearchService;
  let relationInferenceService: RelationInferenceService;
  let testConcept1: CognitiveConceptImpl;
  let testConcept2: CognitiveConceptImpl;

  beforeEach(() => {
    mockLLMClient = new MockLLMClient();
    mockSimilarityService = new MockSimilaritySearchService();
    relationInferenceService = new LLMBasedRelationInferenceService(mockLLMClient, mockSimilarityService);

    // Create test concepts
    testConcept1 = new CognitiveConceptImpl(
      'test-concept-1',
      'test-model-id',
      'Test Concept 1',
      3,
      0.9,
      'First test concept'
    );

    testConcept2 = new CognitiveConceptImpl(
      'test-concept-2',
      'test-model-id',
      'Test Concept 2',
      3,
      0.85,
      'Second test concept'
    );
  });

  describe('inferRelation', () => {
    it('should return relation inference result', async () => {
      const result = await relationInferenceService.inferRelation({
        sourceConcept: testConcept1,
        targetConcept: testConcept2
      });

      expect(result).toHaveProperty('relationType');
      expect(result).toHaveProperty('confidenceScore');
      expect(result).toHaveProperty('description');
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    });

    it('should handle context parameter', async () => {
      const result = await relationInferenceService.inferRelation({
        sourceConcept: testConcept1,
        targetConcept: testConcept2,
        context: 'Test context'
      });

      expect(result).toHaveProperty('relationType');
      expect(result).toHaveProperty('confidenceScore');
      expect(result).toHaveProperty('description');
    });
  });

  describe('batchInferRelations', () => {
    it('should return array of relation inference results', async () => {
      const requests = [
        {
          sourceConcept: testConcept1,
          targetConcept: testConcept2
        },
        {
          sourceConcept: testConcept2,
          targetConcept: testConcept1
        }
      ];

      const results = await relationInferenceService.batchInferRelations(requests);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(requests.length);
      results.forEach(result => {
        expect(result).toHaveProperty('relationType');
        expect(result).toHaveProperty('confidenceScore');
        expect(result).toHaveProperty('description');
      });
    });

    it('should handle empty requests array', async () => {
      const results = await relationInferenceService.batchInferRelations([]);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('inferConceptRelations', () => {
    it('should return array of cognitive relations', async () => {
      const existingConcepts = [testConcept2];
      const results = await relationInferenceService.inferConceptRelations(testConcept1, existingConcepts);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty existing concepts array', async () => {
      const results = await relationInferenceService.inferConceptRelations(testConcept1, []);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });
});
