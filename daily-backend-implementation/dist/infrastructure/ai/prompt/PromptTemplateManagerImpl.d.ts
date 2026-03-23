import { PromptTemplate, PromptTemplateConfig, PromptTemplateManager, PromptGenerationOptions } from '../../../application/services/llm/prompt/PromptTemplate';
import { LoggerService } from '../../logging/logger.service';
export declare class PromptTemplateManagerImpl implements PromptTemplateManager {
    private readonly templates;
    private readonly logger;
    constructor(logger: LoggerService);
    registerTemplate(template: PromptTemplateConfig): void;
    getTemplate(name: string): PromptTemplate | undefined;
    generatePrompt(options: PromptGenerationOptions): string;
    getAllTemplates(): Map<string, PromptTemplate>;
    removeTemplate(name: string): void;
    updateTemplate(template: PromptTemplateConfig): void;
    private registerDefaultTemplates;
}
//# sourceMappingURL=PromptTemplateManagerImpl.d.ts.map