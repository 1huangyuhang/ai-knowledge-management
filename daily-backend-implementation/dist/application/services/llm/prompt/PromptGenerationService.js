"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptGenerationService = void 0;
class PromptGenerationService {
    promptTemplateManager;
    llmClient;
    logger;
    config;
    constructor(promptTemplateManager, llmClient, logger, config = {}) {
        this.promptTemplateManager = promptTemplateManager;
        this.llmClient = llmClient;
        this.logger = logger;
        this.config = {
            defaultTemplate: 'default',
            temperature: 0.7,
            maxTokens: 1000,
            ...config,
        };
    }
    async generateAndExecutePrompt(options) {
        const prompt = this.promptTemplateManager.generatePrompt(options);
        const response = await this.llmClient.generateText(prompt, {
            temperature: options.temperature || this.config.temperature,
            maxTokens: options.maxTokens || this.config.maxTokens,
        });
        return response;
    }
    async *generateAndStreamPrompt(options) {
        const prompt = this.promptTemplateManager.generatePrompt(options);
        yield* this.llmClient.streamText(prompt, {
            temperature: options.temperature || this.config.temperature,
            maxTokens: options.maxTokens || this.config.maxTokens,
        });
    }
    getPromptTemplateManager() {
        return this.promptTemplateManager;
    }
}
exports.PromptGenerationService = PromptGenerationService;
//# sourceMappingURL=PromptGenerationService.js.map