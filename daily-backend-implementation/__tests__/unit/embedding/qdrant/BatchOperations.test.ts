import { QdrantBatchOperations, QdrantBatchOperationsFactory } from '../../../../src/infrastructure/ai/embedding/qdrant/BatchOperations';
import { QdrantClient, QdrantPoint } from '../../../../src/infrastructure/ai/embedding/qdrant/QdrantClient';
import { Vector } from '../../../../src/domain/entities';

// Mock QdrantClient
class MockQdrantClient implements QdrantClient {
  // Mock implementation
  async collectionExists(collectionName: string): Promise<boolean> {
    return true;
  }

  async createCollection(config: any): Promise<void> {
    // Mock implementation
  }

  async insertPoint(collectionName: string, point: QdrantPoint): Promise<void> {
    // Mock implementation
  }

  async insertPoints(collectionName: string, points: QdrantPoint[]): Promise<void> {
    // Mock implementation
  }

  async updatePoint(collectionName: string, point: QdrantPoint): Promise<void> {
    // Mock implementation
  }

  async deletePoint(collectionName: string, id: string): Promise<void> {
    // Mock implementation
  }

  async getPointById(collectionName: string, id: string): Promise<any | null> {
    return null;
  }

  async searchSimilar(collectionName: string, vector: number[], limit: number): Promise<any[]> {
    return Array(limit).fill(null).map((_, index) => ({
      id: `test-result-${index}`,
      vector: [0.1 + index * 0.01, 0.2 + index * 0.01, 0.3 + index * 0.01],
      payload: {
        content: `Test result ${index}`,
        test: `value-${index}`
      },
      score: 0.9 - index * 0.1
    }));
  }
}

describe('QdrantBatchOperations', () => {
  let mockQdrantClient: QdrantClient;
  let batchOperations: QdrantBatchOperations;
  const collectionName = 'test-collection';

  beforeEach(() => {
    mockQdrantClient = new MockQdrantClient();
    batchOperations = new QdrantBatchOperations(mockQdrantClient, collectionName);
  });

  describe('batchInsert', () => {
    it('should insert vectors in batches', async () => {
      const vectors: Vector[] = Array(250).fill(null).map((_, index) => new Vector({
        id: `test-vector-${index}`,
        content: `Test content ${index}`,
        embedding: [0.1 + index * 0.01, 0.2 + index * 0.01, 0.3 + index * 0.01],
        metadata: { test: `value-${index}` }
      }));

      // Spy on insertPoints method
      const insertPointsSpy = jest.spyOn(mockQdrantClient, 'insertPoints').mockImplementation(() => Promise.resolve());

      await batchOperations.batchInsert(vectors, 100);

      // Should call insertPoints 3 times for 250 vectors with batch size 100 (100 + 100 + 50)
      expect(insertPointsSpy).toHaveBeenCalledTimes(3);

      insertPointsSpy.mockRestore();
    });

    it('should handle empty vectors array', async () => {
      const vectors: Vector[] = [];

      // Spy on insertPoints method
      const insertPointsSpy = jest.spyOn(mockQdrantClient, 'insertPoints').mockImplementation(() => Promise.resolve());

      await batchOperations.batchInsert(vectors);

      // Should not call insertPoints
      expect(insertPointsSpy).not.toHaveBeenCalled();

      insertPointsSpy.mockRestore();
    });
  });

  describe('batchDelete', () => {
    it('should delete vectors in batches', async () => {
      const ids: string[] = Array(250).fill(null).map((_, index) => `test-vector-${index}`);

      // Spy on deletePoint method
      const deletePointSpy = jest.spyOn(mockQdrantClient, 'deletePoint').mockImplementation(() => Promise.resolve());

      await batchOperations.batchDelete(ids, 100);

      // Should call deletePoint 250 times (once per id)
      expect(deletePointSpy).toHaveBeenCalledTimes(250);

      deletePointSpy.mockRestore();
    });

    it('should handle empty ids array', async () => {
      const ids: string[] = [];

      // Spy on deletePoint method
      const deletePointSpy = jest.spyOn(mockQdrantClient, 'deletePoint').mockImplementation(() => Promise.resolve());

      await batchOperations.batchDelete(ids);

      // Should not call deletePoint
      expect(deletePointSpy).not.toHaveBeenCalled();

      deletePointSpy.mockRestore();
    });
  });

  describe('batchUpdate', () => {
    it('should update vectors in batches', async () => {
      const vectors: Vector[] = Array(250).fill(null).map((_, index) => new Vector({
        id: `test-vector-${index}`,
        content: `Test content ${index}`,
        embedding: [0.1 + index * 0.01, 0.2 + index * 0.01, 0.3 + index * 0.01],
        metadata: { test: `value-${index}` }
      }));

      // Spy on updatePoint method
      const updatePointSpy = jest.spyOn(mockQdrantClient, 'updatePoint').mockImplementation(() => Promise.resolve());

      await batchOperations.batchUpdate(vectors, 100);

      // Should call updatePoint 250 times (once per vector)
      expect(updatePointSpy).toHaveBeenCalledTimes(250);

      updatePointSpy.mockRestore();
    });

    it('should handle empty vectors array', async () => {
      const vectors: Vector[] = [];

      // Spy on updatePoint method
      const updatePointSpy = jest.spyOn(mockQdrantClient, 'updatePoint').mockImplementation(() => Promise.resolve());

      await batchOperations.batchUpdate(vectors);

      // Should not call updatePoint
      expect(updatePointSpy).not.toHaveBeenCalled();

      updatePointSpy.mockRestore();
    });
  });

  describe('batchSearch', () => {
    it('should search vectors in batches', async () => {
      const embeddings: number[][] = Array(25).fill(null).map((_, index) => [0.1 + index * 0.01, 0.2 + index * 0.01, 0.3 + index * 0.01]);
      const limit = 3;

      // Spy on searchSimilar method
      const searchSimilarSpy = jest.spyOn(mockQdrantClient, 'searchSimilar').mockImplementation(() => Promise.resolve(
        Array(limit).fill(null).map((_, index) => ({
          id: `test-result-${index}`,
          vector: [0.1 + index * 0.01, 0.2 + index * 0.01, 0.3 + index * 0.01],
          payload: {
            content: `Test result ${index}`,
            test: `value-${index}`
          },
          score: 0.9 - index * 0.1
        }))
      ));


      const results = await batchOperations.batchSearch(embeddings, limit, 10);

      // Should call searchSimilar 25 times (once per embedding)
      expect(searchSimilarSpy).toHaveBeenCalledTimes(25);
      // Should return 25 batches of results
      expect(results).toHaveLength(25);
      // Each batch should have 3 results
      results.forEach(batch => {
        expect(batch).toHaveLength(limit);
        batch.forEach(result => {
          expect(result).toHaveProperty('vector');
          expect(result).toHaveProperty('score');
          expect(result.vector).toBeInstanceOf(Vector);
        });
      });

      searchSimilarSpy.mockRestore();
    });

    it('should handle empty embeddings array', async () => {
      const embeddings: number[][] = [];
      const limit = 3;

      // Spy on searchSimilar method
      const searchSimilarSpy = jest.spyOn(mockQdrantClient, 'searchSimilar').mockImplementation(() => Promise.resolve([]));

      const results = await batchOperations.batchSearch(embeddings, limit);

      // Should not call searchSimilar
      expect(searchSimilarSpy).not.toHaveBeenCalled();
      // Should return empty array
      expect(results).toEqual([]);

      searchSimilarSpy.mockRestore();
    });
  });
});

describe('QdrantBatchOperationsFactory', () => {
  it('should create QdrantBatchOperations instance', () => {
    const mockClient = new MockQdrantClient();
    const factory = new QdrantBatchOperationsFactory(mockClient);
    const collectionName = 'test-collection';

    const batchOperations = factory.create(collectionName);

    expect(batchOperations).toBeInstanceOf(QdrantBatchOperations);
  });
});
