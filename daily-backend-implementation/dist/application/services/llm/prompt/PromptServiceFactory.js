"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptServiceFactory = void 0;
const PromptTemplateManagerImpl_1 = require("../../../infrastructure/ai/prompt/PromptTemplateManagerImpl");
class PromptServiceFactory {
    static createPromptTemplateManager(logger) {
        return new PromptTemplateManagerImpl_1.PromptTemplateManagerImpl(logger);
    }
}
exports.PromptServiceFactory = PromptServiceFactory;
//# sourceMappingURL=PromptServiceFactory.js.map