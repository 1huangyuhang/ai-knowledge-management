import { LLMClient, LLMClientConfig, LLMRequest, LLMResponse } from '../../application/services/llm/LLMClient';
import { LoggerService } from '../logging/logger.service';
import { ErrorHandler } from '../error/error-handler';
export declare class LLMClientImpl implements LLMClient {
    private readonly axiosInstance;
    private readonly config;
    private readonly logger;
    private readonly errorHandler;
    constructor(config: LLMClientConfig, logger: LoggerService, errorHandler: ErrorHandler);
    sendRequest(request: LLMRequest): Promise<LLMResponse>;
    private sendRequestWithRetry;
    generateText(prompt: string, options?: Partial<LLMRequest>): Promise<string>;
    streamText(prompt: string, options?: Partial<LLMRequest>): AsyncGenerator<string, void, unknown>;
    private streamTextWithRetry;
    private delay;
    getModel(): string;
    getConfig(): LLMClientConfig;
    healthCheck(): boolean;
}
//# sourceMappingURL=LLMClientImpl.d.ts.map