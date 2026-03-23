import { ApiCallService } from './ApiCallService';
import { LLMRequest, LLMResponse } from '../../../application/services/llm/LLMClient';
import { RetryService } from '../../../application/ai/retry/RetryService';
export declare class RetryableApiCallService implements ApiCallService {
    private apiCallService;
    private retryService;
    private retryStrategy;
    constructor(apiCallService: ApiCallService, retryService: RetryService, retryConfig?: any);
    sendRequest(request: LLMRequest): Promise<LLMResponse>;
    sendRequestWithTimeout(request: LLMRequest, timeoutMs: number): Promise<LLMResponse>;
    checkServiceHealth(): Promise<boolean>;
}
//# sourceMappingURL=RetryableApiCallService.d.ts.map