"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiDependencyConfig = void 0;
const LLMClientImpl_1 = require("../../../ai/LLMClientImpl");
const PromptDependencyConfig_1 = require("./PromptDependencyConfig");
const APIDependencyConfig_1 = require("./APIDependencyConfig");
const StructuredDependencyConfig_1 = require("./StructuredDependencyConfig");
const RetryDependencyConfig_1 = require("./RetryDependencyConfig");
const EmbeddingDependencyConfig_1 = require("./EmbeddingDependencyConfig");
class AiDependencyConfig {
    static configure(container) {
        container.registerSingleton('LLMClient', () => {
            const configManager = container.resolve('ConfigManager');
            const loggerService = container.resolve('LoggerService');
            const config = configManager.getLLMConfig();
            return new LLMClientImpl_1.LLMClientImpl(config, loggerService);
        });
        APIDependencyConfig_1.APIDependencyConfig.configure(container);
        PromptDependencyConfig_1.PromptDependencyConfig.configure(container);
        StructuredDependencyConfig_1.StructuredDependencyConfig.configure(container);
        RetryDependencyConfig_1.RetryDependencyConfig.configure(container);
        EmbeddingDependencyConfig_1.EmbeddingDependencyConfig.configure(container);
    }
}
exports.AiDependencyConfig = AiDependencyConfig;
//# sourceMappingURL=DependencyConfig.js.map