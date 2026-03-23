import { APICaller, APICallerConfig, APICallRequest, APICallResponse } from '../../../application/services/llm/api/APICaller';
import { LoggerService } from '../../logging/logger.service';
import { ErrorHandler } from '../../error/error-handler';
export declare class APICallerImpl implements APICaller {
    private readonly axiosInstance;
    private readonly config;
    private readonly logger;
    private readonly errorHandler;
    constructor(config: APICallerConfig, logger: LoggerService, errorHandler: ErrorHandler);
    call<T = any>(request: APICallRequest): Promise<APICallResponse<T>>;
    private callWithRetry;
    get<T = any>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;
    post<T = any>(endpoint: string, body?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;
    put<T = any>(endpoint: string, body?: any, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;
    delete<T = any>(endpoint: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<APICallResponse<T>>;
    getConfig(): APICallerConfig;
    healthCheck(): boolean;
    private delay;
    private convertHeaders;
}
//# sourceMappingURL=APICallerImpl.d.ts.map