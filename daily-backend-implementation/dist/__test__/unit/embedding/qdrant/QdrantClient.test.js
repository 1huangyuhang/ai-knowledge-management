"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QdrantClient_1 = require("../../../../infrastructure/ai/embedding/qdrant/QdrantClient");
class MockAPICaller {
    responses = new Map();
    setResponse(url, response) {
        this.responses.set(url, response);
    }
    async get(request) {
        const response = this.responses.get(request.url);
        if (response) {
            return { data: response };
        }
        throw new Error(`No mock response for ${request.url}`);
    }
    async post(request) {
        const response = this.responses.get(request.url);
        if (response) {
            return { data: response };
        }
        throw new Error(`No mock response for ${request.url}`);
    }
    async put(request) {
        const response = this.responses.get(request.url);
        if (response) {
            return { data: response };
        }
        throw new Error(`No mock response for ${request.url}`);
    }
    async delete(request) {
        const response = this.responses.get(request.url);
        if (response) {
            return { data: response };
        }
        throw new Error(`No mock response for ${request.url}`);
    }
}
describe('QdrantClientImpl', () => {
    let mockCaller;
    let client;
    const config = {
        baseUrl: 'http://localhost:6333',
        defaultVectorSize: 1536,
    };
    beforeEach(() => {
        mockCaller = new MockAPICaller();
        client = new QdrantClient_1.QdrantClientImpl(mockCaller, config);
    });
    describe('createCollection', () => {
        it('should create a collection successfully', async () => {
            const collectionConfig = {
                name: 'test-collection',
                vectorSize: 1536,
                distance: 'Cosine',
            };
            const url = `${config.baseUrl}/collections/${collectionConfig.name}`;
            mockCaller.setResponse(url, {});
            await expect(client.createCollection(collectionConfig)).resolves.not.toThrow();
        });
    });
    describe('deleteCollection', () => {
        it('should delete a collection successfully', async () => {
            const collectionName = 'test-collection';
            const url = `${config.baseUrl}/collections/${collectionName}`;
            mockCaller.setResponse(url, {});
            await expect(client.deleteCollection(collectionName)).resolves.not.toThrow();
        });
    });
    describe('collectionExists', () => {
        it('should return true if collection exists', async () => {
            const collectionName = 'test-collection';
            const url = `${config.baseUrl}/collections/${collectionName}`;
            mockCaller.setResponse(url, { result: { name: collectionName } });
            const exists = await client.collectionExists(collectionName);
            expect(exists).toBe(true);
        });
        it('should return false if collection does not exist', async () => {
            const collectionName = 'non-existent-collection';
            const url = `${config.baseUrl}/collections/${collectionName}`;
            mockCaller.setResponse(url, undefined);
            const exists = await client.collectionExists(collectionName);
            expect(exists).toBe(false);
        });
    });
    describe('insertPoint', () => {
        it('should insert a point successfully', async () => {
            const collectionName = 'test-collection';
            const point = {
                id: 'test-point',
                vector: Array(1536).fill(0.1),
                payload: { content: 'test content' },
            };
            const url = `${config.baseUrl}/collections/${collectionName}/points`;
            mockCaller.setResponse(url, { result: { operation_id: 0, status: 'completed' } });
            await expect(client.insertPoint(collectionName, point)).resolves.not.toThrow();
        });
    });
    describe('insertPoints', () => {
        it('should insert multiple points successfully', async () => {
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
            await expect(client.insertPoints(collectionName, points)).resolves.not.toThrow();
        });
    });
    describe('deletePoint', () => {
        it('should delete a point successfully', async () => {
            const collectionName = 'test-collection';
            const pointId = 'test-point';
            const url = `${config.baseUrl}/collections/${collectionName}/points/${pointId}`;
            mockCaller.setResponse(url, { result: { operation_id: 0, status: 'completed' } });
            await expect(client.deletePoint(collectionName, pointId)).resolves.not.toThrow();
        });
    });
    describe('searchSimilar', () => {
        it('should search similar points successfully', async () => {
            const collectionName = 'test-collection';
            const vector = Array(1536).fill(0.1);
            const limit = 5;
            const url = `${config.baseUrl}/collections/${collectionName}/points/search`;
            const expectedResults = [
                { id: 'test-point-1', score: 0.95, vector: Array(1536).fill(0.1), payload: { content: 'test content 1' } },
                { id: 'test-point-2', score: 0.85, vector: Array(1536).fill(0.15), payload: { content: 'test content 2' } },
            ];
            mockCaller.setResponse(url, { result: expectedResults });
            const results = await client.searchSimilar(collectionName, vector, limit);
            expect(results).toEqual(expectedResults);
            expect(results.length).toBe(2);
        });
    });
    describe('getPointById', () => {
        it('should return a point if it exists', async () => {
            const collectionName = 'test-collection';
            const pointId = 'test-point';
            const expectedPoint = {
                id: pointId,
                vector: Array(1536).fill(0.1),
                payload: { content: 'test content' },
            };
            const url = `${config.baseUrl}/collections/${collectionName}/points/${pointId}`;
            mockCaller.setResponse(url, { result: expectedPoint });
            const point = await client.getPointById(collectionName, pointId);
            expect(point).toEqual(expectedPoint);
        });
        it('should return null if point does not exist', async () => {
            const collectionName = 'test-collection';
            const pointId = 'non-existent-point';
            const url = `${config.baseUrl}/collections/${collectionName}/points/${pointId}`;
            mockCaller.setResponse(url, undefined);
            const point = await client.getPointById(collectionName, pointId);
            expect(point).toBe(null);
        });
    });
});
describe('QdrantClientFactory', () => {
    it('should create a QdrantClientImpl instance', () => {
        const mockCaller = new MockAPICaller();
        const config = {
            baseUrl: 'http://localhost:6333',
            defaultVectorSize: 1536,
        };
        const factory = new QdrantClient_1.QdrantClientFactory(mockCaller, config);
        const client = factory.create();
        expect(client).toBeInstanceOf(QdrantClient_1.QdrantClientImpl);
    });
});
//# sourceMappingURL=QdrantClient.test.js.map