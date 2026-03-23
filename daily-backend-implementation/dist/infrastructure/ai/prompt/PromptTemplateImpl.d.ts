import { PromptTemplate, PromptTemplateConfig } from '../../../application/services/llm/prompt/PromptTemplate';
export declare class PromptTemplateImpl implements PromptTemplate {
    private readonly config;
    constructor(config: PromptTemplateConfig);
    getName(): string;
    getDescription(): string;
    getParameters(): string[];
    generatePrompt(params: Record<string, any>): string;
    getTemplate(): string;
    validateParams(params: Record<string, any>): boolean;
    private extractParameters;
}
//# sourceMappingURL=PromptTemplateImpl.d.ts.map