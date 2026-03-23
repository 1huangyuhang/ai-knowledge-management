"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIService_1 = require("../../../../application/services/llm/api/APIService");
const RetryableAPIService_1 = require("../../../../application/services/llm/api/RetryableAPIService");
class MockAPICaller {
    callCount = 0;
    call = jest.fn().mockImplementation(async (request) => {
        this.callCount++;
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    get = jest.fn().mockImplementation(async (endpoint) => {
        this.callCount++;
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    post = jest.fn().mockImplementation(async (endpoint, body) => {
        this.callCount++;
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    put = jest.fn().mockImplementation(async (endpoint, body) => {
        this.callCount++;
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    delete = jest.fn().mockImplementation(async (endpoint) => {
        this.callCount++;
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    getConfig = jest.fn().mockReturnValue({ maxRetries: 3, retryDelay: 1000 });
    healthCheck = jest.fn().mockReturnValue(true);
    getCallCount() {
        return this.callCount;
    }
}
class MockFailingAPICaller {
    callCount = 0;
    failUntilCount;
    constructor(failUntilCount = 2) {
        this.failUntilCount = failUntilCount;
    }
    call = jest.fn().mockImplementation(async (request) => {
        this.callCount++;
        if (this.callCount <= this.failUntilCount) {
            throw new Error('API call failed');
        }
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    get = jest.fn().mockImplementation(async (endpoint) => {
        this.callCount++;
        if (this.callCount <= this.failUntilCount) {
            throw new Error('API call failed');
        }
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    post = jest.fn().mockImplementation(async (endpoint, body) => {
        this.callCount++;
        if (this.callCount <= this.failUntilCount) {
            throw new Error('API call failed');
        }
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    put = jest.fn().mockImplementation(async (endpoint, body) => {
        this.callCount++;
        if (this.callCount <= this.failUntilCount) {
            throw new Error('API call failed');
        }
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    delete = jest.fn().mockImplementation(async (endpoint) => {
        this.callCount++;
        if (this.callCount <= this.failUntilCount) {
            throw new Error('API call failed');
        }
        return {
            statusCode: 200,
            body: { data: 'test-response' },
            headers: {},
            latency: 100
        };
    });
    getConfig = jest.fn().mockReturnValue({ maxRetries: 3, retryDelay: 1000 });
    healthCheck = jest.fn().mockReturnValue(true);
    getCallCount() {
        return this.callCount;
    }
}
describe('APIService', () => {
    let apiService;
    let mockAPICaller;
    beforeEach(() => {
        mockAPICaller = new MockAPICaller();
        apiService = new APIService_1.APIServiceImpl(mockAPICaller);
    });
    describe('executeLLMRequest', () => {
        it('should execute LLM request successfully', async () => {
            const result = await apiService.executeLLMRequest('/test-endpoint', { prompt: 'test' });
            expect(mockAPICaller.post).toHaveBeenCalledTimes(1);
            expect(mockAPICaller.post).toHaveBeenCalledWith('/test-endpoint', { prompt: 'test' }, undefined);
            expect(result).toEqual({ data: 'test-response' });
        });
        it('should execute LLM request with params successfully', async () => {
            const result = await apiService.executeLLMRequest('/test-endpoint', { prompt: 'test' }, { temperature: 0.7 });
            expect(mockAPICaller.post).toHaveBeenCalledTimes(1);
            expect(mockAPICaller.post).toHaveBeenCalledWith('/test-endpoint', { prompt: 'test' }, { temperature: 0.7 });
            expect(result).toEqual({ data: 'test-response' });
        });
        it('should handle API errors', async () => {
            const failingAPICaller = new MockFailingAPICaller(1);
            const failingApiService = new APIService_1.APIServiceImpl(failingAPICaller);
            await expect(failingApiService.executeLLMRequest('/test-endpoint', { prompt: 'test' }))
                .rejects
                .toThrow('API call failed');
        });
    });
    describe('executeEmbeddingRequest', () => {
        it('should execute Embedding request successfully', async () => {
            const result = await apiService.executeEmbeddingRequest('/embedding-endpoint', { text: 'test text' });
            expect(mockAPICaller.post).toHaveBeenCalledTimes(1);
            expect(mockAPICaller.post).toHaveBeenCalledWith('/embedding-endpoint', { text: 'test text' }, undefined);
            expect(result).toEqual({ data: 'test-response' });
        });
        it('should execute Embedding request with params successfully', async () => {
            const result = await apiService.executeEmbeddingRequest('/embedding-endpoint', { text: 'test text' }, { model: 'text-embedding-ada-002' });
            expect(mockAPICaller.post).toHaveBeenCalledTimes(1);
            expect(mockAPICaller.post).toHaveBeenCalledWith('/embedding-endpoint', { text: 'test text' }, { model: 'text-embedding-ada-002' });
            expect(result).toEqual({ data: 'test-response' });
        });
    });
    describe('healthCheck', () => {
        it('should return health status from apiCaller', () => {
            expect(apiService.healthCheck()).toBe(true);
            expect(mockAPICaller.healthCheck).toHaveBeenCalledTimes(1);
        });
    });
});
describe('RetryableAPIService', () => {
    let retryableApiService;
    let mockAPICaller;
    beforeEach(() => {
        mockAPICaller = new MockAPICaller();
        const apiService = new APIService_1.APIServiceImpl(mockAPICaller);
        retryableApiService = new RetryableAPIService_1.RetryableAPIServiceImpl(apiService);
    });
    describe('executeLLMRequest with retry', () => {
        it('should retry failed LLM requests', async () => {
            const failingAPICaller = new MockFailingAPICaller(2);
            const failingApiService = new APIService_1.APIServiceImpl(failingAPICaller);
            const retryableFailingApiService = new RetryableAPIService_1.RetryableAPIServiceImpl(failingApiService, 3, 10);
            const result = await retryableFailingApiService.executeLLMRequest('/test-endpoint', { prompt: 'test' });
            expect(failingAPICaller.getCallCount()).toBe(3);
            expect(result).toEqual({ data: 'test-response' });
        });
        it('should throw error when max retries exceeded', async () => {
            const failingAPICaller = new MockFailingAPICaller(5);
            const failingApiService = new APIService_1.APIServiceImpl(failingAPICaller);
            const retryableFailingApiService = new RetryableAPIService_1.RetryableAPIServiceImpl(failingApiService, 3, 10);
            await expect(retryableFailingApiService.executeLLMRequest('/test-endpoint', { prompt: 'test' }))
                .rejects
                .toThrow('API call failed');
            expect(failingAPICaller.getCallCount()).toBe(4);
        });
    });
    describe('executeEmbeddingRequest with retry', () => {
        it('should retry failed Embedding requests', async () => {
            const failingAPICaller = new MockFailingAPICaller(1);
            const failingApiService = new APIService_1.APIServiceImpl(failingAPICaller);
            const retryableFailingApiService = new RetryableAPIService_1.RetryableAPIServiceImpl(failingApiService, 3, 10);
            const result = await retryableFailingApiService.executeEmbeddingRequest('/embedding-endpoint', { text: 'test text' });
            expect(failingAPICaller.getCallCount()).toBe(2);
            expect(result).toEqual({ data: 'test-response' });
        });
    });
    describe('retry strategy management', () => {
        it('should set and get retry strategy', () => {
            retryableApiService.setRetryStrategy(5, 2000);
            const strategy = retryableApiService.getRetryStrategy();
            expect(strategy).toEqual({ maxRetries: 5, retryDelay: 2000 });
        });
        it('should use updated retry strategy', async () => {
            const failingAPICaller = new MockFailingAPICaller(4);
            const failingApiService = new APIService_1.APIServiceImpl(failingAPICaller);
            const retryableFailingApiService = new RetryableAPIService_1.RetryableAPIServiceImpl(failingApiService, 3, 10);
            retryableFailingApiService.setRetryStrategy(5, 10);
            const result = await retryableFailingApiService.executeLLMRequest('/test-endpoint', { prompt: 'test' });
            expect(failingAPICaller.getCallCount()).toBe(5);
            expect(result).toEqual({ data: 'test-response' });
        });
    });
    describe('healthCheck', () => {
        it('should return health status from underlying apiService', () => {
            expect(retryableApiService.healthCheck()).toBe(true);
        });
    });
});
//# sourceMappingURL=APIService.test.js.map