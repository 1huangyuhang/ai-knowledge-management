"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OpenAIEmbeddingService_1 = require("../../../infrastructure/ai/embedding/OpenAIEmbeddingService");
class MockAPICaller {
    post(options) {
        return Promise.resolve({
            data: {
                data: [
                    { embedding: [0.1, 0.2, 0.3, 0.4, 0.5], index: 0 },
                    { embedding: [0.6, 0.7, 0.8, 0.9, 1.0], index: 1 }
                ]
            }
        });
    }
    get(options) {
        throw new Error('Method not implemented.');
    }
    put(options) {
        throw new Error('Method not implemented.');
    }
    delete(options) {
        throw new Error('Method not implemented.');
    }
}
describe('OpenAIEmbeddingService', () => {
    let embeddingService;
    let mockAPICaller;
    beforeEach(() => {
        mockAPICaller = new MockAPICaller();
        embeddingService = new OpenAIEmbeddingService_1.OpenAIEmbeddingService(mockAPICaller, {
            apiKey: 'test-api-key',
            model: 'text-embedding-ada-002',
            baseUrl: 'https://api.openai.com/v1'
        });
    });
    describe('embedText', () => {
        it('should generate embedding for single text', async () => {
            const embedding = await embeddingService.embedText('test text');
            expect(embedding.vector).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
            expect(embedding.metadata).toBeDefined();
            expect(embedding.metadata.index).toBe(0);
        });
    });
    describe('embedTexts', () => {
        it('should generate embeddings for multiple texts', async () => {
            const embeddings = await embeddingService.embedTexts(['text 1', 'text 2']);
            expect(embeddings).toHaveLength(2);
            expect(embeddings[0].vector).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
            expect(embeddings[1].vector).toEqual([0.6, 0.7, 0.8, 0.9, 1.0]);
            expect(embeddings[0].metadata.index).toBe(0);
            expect(embeddings[1].metadata.index).toBe(1);
        });
    });
});
//# sourceMappingURL=OpenAIEmbeddingService.test.js.map