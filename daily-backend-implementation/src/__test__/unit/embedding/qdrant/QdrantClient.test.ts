import { QdrantClientImpl, QdrantClientFactory, QdrantClientConfig, QdrantCollectionConfig } from '../../../../infrastructure/ai/embedding/qdrant/QdrantClient';
import { APICaller } from '../../../../infrastructure/ai/api/APICaller';

// Mock APICaller
class MockAPICaller implements APICaller {
  private responses: Map<string, any> = new Map();

  setResponse(url: string, response: any): void {
    this.responses.set(url, response);
  }

  async get<T>(request: { url: string; headers?: Record<string, string>; }): Promise<{ data: T }> {
    const response = this.responses.get(request.url);
    if (response) {
      return { data: response };
    }
    throw new Error(`No mock response for ${request.url}`);
  }

  async post<T>(request: { url: string; headers?: Record<string, string>; data?: any; }): Promise<{ data: T }> {
    const response = this.responses.get(request.url);
    if (response) {
      return { data: response };
    }
    throw new Error(`No mock response for ${request.url}`);
    }

  async put<T>(request: { url: string; headers?: Record<string, string>; data?: any; }): Promise<{ data: T }> {
    const response = this.responses.get(request.url);
    if (response) {
      return { data: response };
    }
    throw new Error(`No mock response for ${request.url}`);
  }

  async delete<T>(request: { url: string; headers?: Record<string, string>; }): Promise<{ data: T }> {
    const response = this.responses.get(request.url);
    if (response) {
      return { data: response };
    }
    throw new Error(`No mock response for ${request.url}`);
  }
}

describe('QdrantClientImpl', () => {
  let mockCaller: MockAPICaller;
  let client: QdrantClientImpl;
  const config: QdrantClientConfig = {
    baseUrl: 'http://localhost:6333',
    defaultVectorSize: 1536,
  };

  beforeEach(() => {
    mockCaller = new MockAPICaller();
    client = new QdrantClientImpl(mockCaller, config);
  });

  describe('createCollection', () => {
    it('should create a collection successfully', async () => {
      // Arrange
      const collectionConfig: QdrantCollectionConfig = {
        name: 'test-collection',
        vectorSize: 1536,
        distance: 'Cosine',
      };
      const url = `${config.baseUrl}/collections/${collectionConfig.name}`;
      mockCaller.setResponse(url, {});

      // Act & Assert
      await expect(client.createCollection(collectionConfig)).resolves.not.toThrow();
    });
  });

  describe('deleteCollection', () => {
    it('should delete a collection successfully', async () => {
      // Arrange
      const collectionName = 'test-collection';
      const url = `${config.baseUrl}/collections/${collectionName}`;
      mockCaller.setResponse(url, {});

      // Act & Assert
      await expect(client.deleteCollection(collectionName)).resolves.not.toThrow();
    });
  });

  describe('collectionExists', () => {
    it('should return true if collection exists', async () => {
      // Arrange
      const collectionName = 'test-collection';
      const url = `${config.baseUrl}/collections/${collectionName}`;
      mockCaller.setResponse(url, { result: { name: collectionName } });

      // Act
      const exists = await client.collectionExists(collectionName);

      // Assert
      expect(exists).toBe(true);
    });

    it('should return false if collection does not exist', async () => {
      // Arrange
      const collectionName = 'non-existent-collection';
      const url = `${config.baseUrl}/collections/${collectionName}`;
      mockCaller.setResponse(url, undefined);

      // Act
      const exists = await client.collectionExists(collectionName);

      // Assert
      expect(exists).toBe(false);
    });
  });

  describe('insertPoint', () => {
    it('should insert a point successfully', async () => {
      // Arrange
      const collectionName = 'test-collection';
      const point = {
        id: 'test-point',
        vector: Array(1536).fill(0.1),
        payload: { content: 'test content' },
      };
      const url = `${config.baseUrl}/collections/${collectionName}/points`;
      mockCaller.setResponse(url, { result: { operation_id: 0, status: 'completed' } });

      // Act & Assert
      await expect(client.insertPoint(collectionName, point)).resolves.not.toThrow();
    });
  });

  describe('insertPoints', () => {
    it('should insert multiple points successfully', async () => {
      // Arrange
      const collectionName = 'test-collection';
      const points = [
        {
          id: 'test-point-1',
          vector: Array(1536).fill(0.1),
          payload: { content: 'test content 1' },
        },
        {
          id: 'test-point-2',
          vector: Array(1536).fill(0.2),
          payload: { content: 'test content 2' },
        },
      ];
      const url = `${config.baseUrl}/collections/${collectionName}/points`;
      mockCaller.setResponse(url, { result: { operation_id: 0, status: 'completed' } });

      // Act & Assert
      await expect(client.insertPoints(collectionName, points)).resolves.not.toThrow();
    });
  });

  describe('deletePoint', () => {
    it('should delete a point successfully', async () => {
      // Arrange
      const collectionName = 'test-collection';
      const pointId = 'test-point';
      const url = `${config.baseUrl}/collections/${collectionName}/points/${pointId}`;
      mockCaller.setResponse(url, { result: { operation_id: 0, status: 'completed' } });

      // Act & Assert
      await expect(client.deletePoint(collectionName, pointId)).resolves.not.toThrow();
    });
  });

  describe('searchSimilar', () => {
    it('should search similar points successfully', async () => {
      // Arrange
      const collectionName = 'test-collection';
      const vector = Array(1536).fill(0.1);
      const limit = 5;
      const url = `${config.baseUrl}/collections/${collectionName}/points/search`;
      const expectedResults = [
        { id: 'test-point-1', score: 0.95, vector: Array(1536).fill(0.1), payload: { content: 'test content 1' } },
        { id: 'test-point-2', score: 0.85, vector: Array(1536).fill(0.15), payload: { content: 'test content 2' } },
      ];
      mockCaller.setResponse(url, { result: expectedResults });

      // Act
      const results = await client.searchSimilar(collectionName, vector, limit);

      // Assert
      expect(results).toEqual(expectedResults);
      expect(results.length).toBe(2);
    });
  });

  describe('getPointById', () => {
    it('should return a point if it exists', async () => {
      // Arrange
      const collectionName = 'test-collection';
      const pointId = 'test-point';
      const expectedPoint = {
        id: pointId,
        vector: Array(1536).fill(0.1),
        payload: { content: 'test content' },
      };
      const url = `${config.baseUrl}/collections/${collectionName}/points/${pointId}`;
      mockCaller.setResponse(url, { result: expectedPoint });

      // Act
      const point = await client.getPointById(collectionName, pointId);

      // Assert
      expect(point).toEqual(expectedPoint);
    });

    it('should return null if point does not exist', async () => {
      // Arrange
      const collectionName = 'test-collection';
      const pointId = 'non-existent-point';
      const url = `${config.baseUrl}/collections/${collectionName}/points/${pointId}`;
      mockCaller.setResponse(url, undefined);

      // Act
      const point = await client.getPointById(collectionName, pointId);

      // Assert
      expect(point).toBe(null);
    });
  });
});

describe('QdrantClientFactory', () => {
  it('should create a QdrantClientImpl instance', () => {
    // Arrange
    const mockCaller = new MockAPICaller();
    const config: QdrantClientConfig = {
      baseUrl: 'http://localhost:6333',
      defaultVectorSize: 1536,
    };

    // Act
    const factory = new QdrantClientFactory(mockCaller, config);
    const client = factory.create();

    // Assert
    expect(client).toBeInstanceOf(QdrantClientImpl);
  });
});