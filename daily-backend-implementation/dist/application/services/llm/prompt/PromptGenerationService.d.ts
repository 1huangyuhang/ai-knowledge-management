import { PromptTemplateManager } from './PromptTemplate';
import { LLMClient } from '../LLMClient';
import { LoggerService } from '../../../infrastructure/logging/logger.service';
export interface PromptGenerationServiceConfig {
    defaultTemplate?: string;
    temperature?: number;
    maxTokens?: number;
}
export declare class PromptGenerationService {
    private readonly promptTemplateManager;
    private readonly llmClient;
    private readonly logger;
    private readonly config;
    constructor(promptTemplateManager: PromptTemplateManager, llmClient: LLMClient, logger: LoggerService, config?: PromptGenerationServiceConfig);
    generateAndExecutePrompt(options: any): Promise<string>;
    generateAndStreamPrompt(options: any): AsyncGenerator<string, void, unknown>;
    getPromptTemplateManager(): PromptTemplateManager;
}
//# sourceMappingURL=PromptGenerationService.d.ts.map