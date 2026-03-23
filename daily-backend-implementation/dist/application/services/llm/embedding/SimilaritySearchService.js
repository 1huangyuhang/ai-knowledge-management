"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimilaritySearchServiceImpl = void 0;
class SimilaritySearchServiceImpl {
    vectorRepository;
    embeddingService;
    constructor(vectorRepository, embeddingService) {
        this.vectorRepository = vectorRepository;
        this.embeddingService = embeddingService;
    }
    async searchSimilar(queryEmbedding, limit = 5, filters) {
        try {
            const similarVectorsWithScores = await this.vectorRepository.searchSimilar(queryEmbedding, limit);
            return similarVectorsWithScores.map(({ vector, score }) => ({
                vector,
                score,
                metadata: vector.metadata
            }));
        }
        catch (error) {
            throw new Error(`Failed to search similar vectors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async searchSimilarByContent(content, limit = 5) {
        try {
            const vector = await this.embeddingService.embedText(content);
            return this.searchSimilar(vector.embedding, limit);
        }
        catch (error) {
            throw new Error(`Failed to search similar vectors by content: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async batchSearchSimilar(queryEmbeddings, limit = 5) {
        try {
            const searchPromises = queryEmbeddings.map(embedding => this.searchSimilar(embedding, limit));
            return await Promise.all(searchPromises);
        }
        catch (error) {
            throw new Error(`Failed to batch search similar vectors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.SimilaritySearchServiceImpl = SimilaritySearchServiceImpl;
//# sourceMappingURL=SimilaritySearchService.js.map