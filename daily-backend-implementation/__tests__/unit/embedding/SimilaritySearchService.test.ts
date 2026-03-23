import { SimilaritySearchService, SimilaritySearchServiceImpl } from '../../../src/application/services/llm/embedding/SimilaritySearchService';
import { EmbeddingService } from '../../../src/application/services/llm/embedding/EmbeddingService';
import { VectorRepository } from '../../../src/infrastructure/ai/embedding/qdrant/VectorRepository';
import { Vector } from '../../../src/domain/entities';

// Mock依赖
class MockEmbeddingService implements EmbeddingService {
  async embedText(text: string): Promise<Vector> {
    return new Vector({
      id: `test-embed-${text}`,
      content: text,
      embedding: [0.1, 0.2, 0.3],
      metadata: { text }
    });
  }

  async embedTexts(texts: string[]): Promise<Vector[]> {
    return texts.map(text => new Vector({
      id: `test-embed-${text}`,
      content: text,
      embedding: [0.1, 0.2, 0.3],
      metadata: { text }
    }));
  }
}

class MockVectorRepository implements VectorRepository {
  async saveVector(vector: Vector): Promise<void> {
    // Mock implementation
  }

  async saveVectors(vectors: Vector[]): Promise<void> {
    // Mock implementation
  }

  async deleteVector(id: string): Promise<void> {
    // Mock implementation
  }

  async getVectorById(id: string): Promise<Vector | null> {
    return null;
  }

  async searchSimilar(embedding: number[], limit: number = 5): Promise<Array<{vector: Vector; score: number}>> {
    return Array(limit).fill(null).map((_, index) => ({
      vector: new Vector({
        id: `test-vector-${index}`,
        content: `Test content ${index}`,
        embedding: [0.1 + index * 0.01, 0.2 + index * 0.01, 0.3 + index * 0.01],
        metadata: { test: `value-${index}` }
      }),
      score: 0.9 - index * 0.1
    }));
  }
}

describe('SimilaritySearchService', () => {
  let similaritySearchService: SimilaritySearchService;
  let mockEmbeddingService: EmbeddingService;
  let mockVectorRepository: VectorRepository;

  beforeEach(() => {
    mockEmbeddingService = new MockEmbeddingService();
    mockVectorRepository = new MockVectorRepository();
    similaritySearchService = new SimilaritySearchServiceImpl(
      mockVectorRepository,
      mockEmbeddingService
    );
  });

  describe('searchSimilar', () => {
    it('should return similar vectors with scores', async () => {
      const queryEmbedding = [0.1, 0.2, 0.3];
      const limit = 3;

      const results = await similaritySearchService.searchSimilar(queryEmbedding, limit);

      expect(results).toHaveLength(limit);
      results.forEach((result, index) => {
        expect(result).toHaveProperty('vector');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('metadata');
        expect(result.score).toBeCloseTo(0.9 - index * 0.1);
      });
    });

    it('should use default limit when not provided', async () => {
      const queryEmbedding = [0.1, 0.2, 0.3];

      const results = await similaritySearchService.searchSimilar(queryEmbedding);

      expect(results).toHaveLength(5);
    });

    it('should handle filters parameter (not implemented yet)', async () => {
      const queryEmbedding = [0.1, 0.2, 0.3];
      const limit = 3;
      const filters = { test: 'value' };

      const results = await similaritySearchService.searchSimilar(queryEmbedding, limit, filters);

      expect(results).toHaveLength(limit);
    });
  });

  describe('searchSimilarByContent', () => {
    it('should convert text to embedding and search similar vectors', async () => {
      const content = 'test content';
      const limit = 2;

      const results = await similaritySearchService.searchSimilarByContent(content, limit);

      expect(results).toHaveLength(limit);
      results.forEach(result => {
        expect(result).toHaveProperty('vector');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('metadata');
      });
    });

    it('should use default limit when not provided', async () => {
      const content = 'test content';

      const results = await similaritySearchService.searchSimilarByContent(content);

      expect(results).toHaveLength(5);
    });
  });

  describe('batchSearchSimilar', () => {
    it('should search similar vectors for multiple embeddings', async () => {
      const queryEmbeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6]
      ];
      const limit = 2;

      const results = await similaritySearchService.batchSearchSimilar(queryEmbeddings, limit);

      expect(results).toHaveLength(queryEmbeddings.length);
      results.forEach(batchResults => {
        expect(batchResults).toHaveLength(limit);
        batchResults.forEach(result => {
          expect(result).toHaveProperty('vector');
          expect(result).toHaveProperty('score');
          expect(result).toHaveProperty('metadata');
        });
      });
    });

    it('should use default limit when not provided', async () => {
      const queryEmbeddings = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6]
      ];

      const results = await similaritySearchService.batchSearchSimilar(queryEmbeddings);

      expect(results).toHaveLength(queryEmbeddings.length);
      results.forEach(batchResults => {
        expect(batchResults).toHaveLength(5);
      });
    });

    it('should return empty array when no embeddings provided', async () => {
      const queryEmbeddings: number[][] = [];
      const limit = 2;

      const results = await similaritySearchService.batchSearchSimilar(queryEmbeddings, limit);

      expect(results).toEqual([]);
    });
  });
});
