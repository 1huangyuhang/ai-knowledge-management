"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptDependencyConfig = void 0;
const PromptTemplateImpl_1 = require("../../ai/prompt/PromptTemplateImpl");
const PromptTemplateManagerImpl_1 = require("../../ai/prompt/PromptTemplateManagerImpl");
const PromptGenerationService_1 = require("../../../application/services/llm/prompt/PromptGenerationService");
const PromptServiceFactory_1 = require("../../../application/services/llm/prompt/PromptServiceFactory");
class PromptDependencyConfig {
    static configure(container) {
        container.register('PromptTemplate', () => new PromptTemplateImpl_1.PromptTemplateImpl());
        container.register('PromptTemplateManager', () => {
            const logger = container.get('LoggerService');
            return new PromptTemplateManagerImpl_1.PromptTemplateManagerImpl(logger);
        });
        container.register('PromptServiceFactory', () => {
            const logger = container.get('LoggerService');
            return new PromptServiceFactory_1.PromptServiceFactory(logger);
        });
        container.register('PromptGenerationService', () => {
            const promptTemplateManager = container.get('PromptTemplateManager');
            const llmClient = container.get('LLMClient');
            const logger = container.get('LoggerService');
            return new PromptGenerationService_1.PromptGenerationService(promptTemplateManager, llmClient, logger);
        });
    }
}
exports.PromptDependencyConfig = PromptDependencyConfig;
//# sourceMappingURL=PromptDependencyConfig.js.map