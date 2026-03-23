export interface PromptTemplateConfig {
    name: string;
    template: string;
    description?: string;
    parameters?: string[];
    defaultParams?: Record<string, any>;
    version?: string;
    type?: string;
}
export interface PromptGenerationOptions {
    params?: Record<string, any>;
    templateName?: string;
    customTemplate?: string;
}
export interface PromptTemplate {
    getName(): string;
    getDescription(): string;
    getParameters(): string[];
    generatePrompt(params: Record<string, any>): string;
    getTemplate(): string;
    validateParams(params: Record<string, any>): boolean;
}
export interface PromptTemplateManager {
    registerTemplate(template: PromptTemplateConfig): void;
    getTemplate(name: string): PromptTemplate | undefined;
    generatePrompt(options: PromptGenerationOptions): string;
    getAllTemplates(): Map<string, PromptTemplate>;
    removeTemplate(name: string): void;
    updateTemplate(template: PromptTemplateConfig): void;
}
//# sourceMappingURL=PromptTemplate.d.ts.map