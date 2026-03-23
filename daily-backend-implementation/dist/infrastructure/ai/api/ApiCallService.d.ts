import { LLMRequest, LLMResponse } from '../../../application/services/llm/LLMClient';
export interface ApiCallService {
    sendRequest(request: LLMRequest): Promise<LLMResponse>;
    sendRequestWithTimeout(request: LLMRequest, timeoutMs: number): Promise<LLMResponse>;
    checkServiceHealth(): Promise<boolean>;
}
//# sourceMappingURL=ApiCallService.d.ts.map