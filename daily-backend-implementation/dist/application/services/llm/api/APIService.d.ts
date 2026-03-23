import { APICaller } from './APICaller';
export interface APIService {
    executeLLMRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T>;
    executeEmbeddingRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T>;
    healthCheck(): boolean;
}
export declare class APIServiceImpl implements APIService {
    private readonly apiCaller;
    constructor(apiCaller: APICaller);
    executeLLMRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T>;
    executeEmbeddingRequest<T = any>(endpoint: string, body: any, params?: Record<string, any>): Promise<T>;
    healthCheck(): boolean;
}
//# sourceMappingURL=APIService.d.ts.map