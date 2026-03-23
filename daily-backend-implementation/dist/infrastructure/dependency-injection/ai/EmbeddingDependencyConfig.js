"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingDependencyConfig = void 0;
const OpenAIEmbeddingService_1 = require("../../ai/embedding/OpenAIEmbeddingService");
const APICaller_1 = require("../../ai/api/APICaller");
class EmbeddingDependencyConfig {
    register(container) {
        container.register(EmbeddingService_1.EmbeddingServiceFactory, {
            useFactory: () => {
                const apiCaller = container.resolve(APICaller_1.APICaller);
                return new OpenAIEmbeddingService_1.OpenAIEmbeddingServiceFactory(apiCaller, {
                    apiKey: process.env.OPENAI_API_KEY || '',
                    model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
                    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
                });
            }
        });
    }
}
exports.EmbeddingDependencyConfig = EmbeddingDependencyConfig;
//# sourceMappingURL=EmbeddingDependencyConfig.js.map