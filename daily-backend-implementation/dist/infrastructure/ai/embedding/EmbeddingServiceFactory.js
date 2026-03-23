"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingServiceFactory = exports.EmbeddingServiceType = void 0;
const OpenAIEmbeddingService_1 = require("./OpenAIEmbeddingService");
var EmbeddingServiceType;
(function (EmbeddingServiceType) {
    EmbeddingServiceType["OpenAI"] = "openai";
    EmbeddingServiceType["Local"] = "local";
})(EmbeddingServiceType || (exports.EmbeddingServiceType = EmbeddingServiceType = {}));
class EmbeddingServiceFactory {
    static createService(type, config, logger) {
        const fullConfig = { ...OpenAIEmbeddingService_1.DEFAULT_OPENAI_EMBEDDING_CONFIG, ...config };
        switch (type) {
            case EmbeddingServiceType.OpenAI:
                return new OpenAIEmbeddingService_1.OpenAIEmbeddingService(fullConfig, logger);
            case EmbeddingServiceType.Local:
                logger.warn('Local Embedding service not implemented yet, falling back to OpenAI');
                return new OpenAIEmbeddingService_1.OpenAIEmbeddingService(fullConfig, logger);
            default:
                logger.warn(`Unknown Embedding service type: ${type}, falling back to OpenAI`);
                return new OpenAIEmbeddingService_1.OpenAIEmbeddingService(fullConfig, logger);
        }
    }
}
exports.EmbeddingServiceFactory = EmbeddingServiceFactory;
//# sourceMappingURL=EmbeddingServiceFactory.js.map