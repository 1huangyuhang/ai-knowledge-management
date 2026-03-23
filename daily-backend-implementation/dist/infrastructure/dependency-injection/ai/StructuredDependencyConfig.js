"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredDependencyConfig = void 0;
const StructuredOutputGeneratorImpl_1 = require("../../../ai/structured/StructuredOutputGeneratorImpl");
class StructuredDependencyConfig {
    static configure(container) {
        container.registerSingleton('StructuredOutputGenerator', () => {
            const llmClient = container.resolve('LLMClient');
            const loggerService = container.resolve('LoggerService');
            const errorHandler = container.resolve('ErrorHandler');
            return new StructuredOutputGeneratorImpl_1.StructuredOutputGeneratorImpl(llmClient, loggerService, errorHandler);
        });
    }
}
exports.StructuredDependencyConfig = StructuredDependencyConfig;
//# sourceMappingURL=StructuredDependencyConfig.js.map