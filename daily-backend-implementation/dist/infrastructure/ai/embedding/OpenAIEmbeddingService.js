"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIEmbeddingServiceFactory = exports.OpenAIEmbeddingService = void 0;
const EmbeddingError_1 = require("../../../application/ai/embedding/EmbeddingError");
class OpenAIEmbeddingService {
    caller;
    config;
    constructor(caller, config) {
        this.caller = caller;
        this.config = config;
    }
    async embedText(text) {
        const vectors = await this.embedTexts([text]);
        return vectors[0];
    }
    async embedTexts(texts) {
        try {
            const response = await this.caller.post({
                url: `${this.config.baseUrl}/embeddings`,
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    model: this.config.model,
                    input: texts
                }
            });
            return response.data.data.map(item => ({
                vector: item.embedding,
                metadata: {
                    index: item.index
                }
            }));
        }
        catch (error) {
            throw new EmbeddingError_1.EmbeddingError(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`, 'OPENAI_EMBEDDING_FAILED');
        }
    }
}
exports.OpenAIEmbeddingService = OpenAIEmbeddingService;
class OpenAIEmbeddingServiceFactory {
    caller;
    config;
    constructor(caller, config) {
        this.caller = caller;
        this.config = config;
    }
    create() {
        return new OpenAIEmbeddingService(this.caller, this.config);
    }
}
exports.OpenAIEmbeddingServiceFactory = OpenAIEmbeddingServiceFactory;
//# sourceMappingURL=OpenAIEmbeddingService.js.map