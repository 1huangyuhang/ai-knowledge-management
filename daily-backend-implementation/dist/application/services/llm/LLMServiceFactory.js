"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMServiceFactory = void 0;
const LLMClientImpl_1 = require("../../../infrastructure/ai/LLMClientImpl");
class LLMServiceFactory {
    static createLLMClient(config, logger, errorHandler) {
        return new LLMClientImpl_1.LLMClientImpl(config, logger, errorHandler);
    }
}
exports.LLMServiceFactory = LLMServiceFactory;
//# sourceMappingURL=LLMServiceFactory.js.map