"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OpenAIEmbeddingService_1 = require("../../../infrastructure/ai/embedding/OpenAIEmbeddingService");
const mockAPICaller = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
};
const testConfig = {
    apiKey: 'test-api-key',
    model: 'text-embedding-ada-002',
    baseUrl: 'https://api.openai.com/v1',
};
describe('OpenAIEmbeddingService', () => {
    let embeddingService;
    beforeEach(() => {
        jest.clearAllMocks();
        embeddingService = new OpenAIEmbeddingService_1.OpenAIEmbeddingService(mockAPICaller, testConfig);
    });
    describe('embedText', () => {
        it('should call embedTexts with single text', async () => {
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
            mockAPICaller.post.mockResolvedValue(mockResponse);
            const result = await embeddingService.embedText('test text');
            expect(result).toEqual({
                vector: [0.1, 0.2, 0.3],
                metadata: {
                    index: 0,
                },
            });
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
            mockAPICaller.post.mockResolvedValue(mockResponse);
            const texts = ['text 1', 'text 2'];
            const result = await embeddingService.embedTexts(texts);
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
            const mockError = new Error('API Error');
            mockAPICaller.post.mockRejectedValue(mockError);
            await expect(embeddingService.embedTexts(['test text'])).rejects.toThrow('Failed to generate embeddings: API Error');
        });
        it('should handle empty texts array', async () => {
            const mockResponse = {
                data: {
                    data: [],
                },
            };
            mockAPICaller.post.mockResolvedValue(mockResponse);
            const result = await embeddingService.embedTexts([]);
            expect(result).toEqual([]);
            expect(mockAPICaller.post).toHaveBeenCalledTimes(1);
        });
    });
});
//# sourceMappingURL=OpenAIEmbeddingService.test.js.map