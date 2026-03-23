import { APIService } from './APIService';
export interface RetryableAPIService extends APIService {
    setRetryStrategy(maxRetries: number, retryDelay: number): void;
    getRetryStrategy(): {
        maxRetries: number;
        retryDelay: number;
    };
}
export declare class RetryableAPIServiceImpl implements RetryableAPIService {
    private readonly apiService;
    private maxRetries;
    private retryDelay;
    constructor(apiService: APIService, maxRetries?: number, retryDelay?: number);
    executeLLMRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T>;
    executeEmbeddingRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T>;
    healthCheck(): boolean;
    setRetryStrategy(maxRetries: number, retryDelay: number): void;
    getRetryStrategy(): {
        maxRetries: number;
        retryDelay: number;
    };
    private executeWithRetry;
    private delay;
}
//# sourceMappingURL=RetryableAPIService.d.ts.map