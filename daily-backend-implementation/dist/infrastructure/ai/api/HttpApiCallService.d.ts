import { LLMRequest, LLMResponse } from '../../../application/services/llm/LLMClient';
import { ApiCallService } from './ApiCallService';
import { LoggerService } from '../../../infrastructure/logging/logger.service';
export declare class HttpApiCallService implements ApiCallService {
    private defaultTimeout;
    private axiosInstance;
    private logger;
    constructor(baseUrl: string, apiKey: string, logger: LoggerService, defaultTimeout?: number);
    sendRequest(request: LLMRequest): Promise<LLMResponse>;
    sendRequestWithTimeout(request: LLMRequest, timeoutMs: number): Promise<LLMResponse>;
    checkServiceHealth(): Promise<boolean>;
    private mapResponse;
    private handleApiError;
}
//# sourceMappingURL=HttpApiCallService.d.ts.map