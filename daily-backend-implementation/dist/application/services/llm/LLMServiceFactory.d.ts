import { LLMClient } from './LLMClient';
import { LLMClientConfig } from './LLMClient';
import { LoggerService } from '../../../infrastructure/logging/logger.service';
import { ErrorHandler } from '../../../infrastructure/error/error-handler';
export declare class LLMServiceFactory {
    static createLLMClient(config: LLMClientConfig, logger: LoggerService, errorHandler: ErrorHandler): LLMClient;
}
//# sourceMappingURL=LLMServiceFactory.d.ts.map