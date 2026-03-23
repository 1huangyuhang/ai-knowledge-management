export interface APICallerConfig {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
}
export interface APICallRequest {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    params?: Record<string, any>;
}
export interface APICallResponse<T = any> {
    statusCode: number;
    body: T;
    headers: Record<string, string>;
    latency: number;
}
export interface APICallError {
    message: string;
    statusCode?: number;
    type: string;
    originalError?: any;
}
export interface APICaller {
    call<T = any>(request: APICallRequest): Promise<APICallResponse<T>>;
    get<T = any>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;
    post<T = any>(endpoint: string, body?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;
    put<T = any>(endpoint: string, body?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;
    delete<T = any>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;
    getConfig(): APICallerConfig;
    healthCheck(): boolean;
}
//# sourceMappingURL=APICaller.d.ts.map