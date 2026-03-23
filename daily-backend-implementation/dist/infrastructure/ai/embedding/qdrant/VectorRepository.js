"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorRepositoryFactory = exports.VectorRepository = void 0;
const entities_1 = require("../../../../domain/entities");
const VectorStoreError_1 = require("../VectorStoreError");
class VectorRepository {
    client;
    config;
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.initializeCollection();
    }
    async initializeCollection() {
        try {
            const exists = await this.client.collectionExists(this.config.collectionName);
            if (!exists) {
                await this.client.createCollection({
                    name: this.config.collectionName,
                    vectorSize: this.config.vectorSize,
                    distance: this.config.distance,
                });
            }
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to initialize vector collection: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async saveVector(vector) {
        try {
            const point = {
                id: vector.id,
                vector: vector.embedding,
                payload: {
                    ...vector.metadata,
                    content: vector.content,
                },
            };
            await this.client.insertPoint(this.config.collectionName, point);
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to save vector: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async saveVectors(vectors) {
        try {
            const points = vectors.map((vector) => ({
                id: vector.id,
                vector: vector.embedding,
                payload: {
                    ...vector.metadata,
                    content: vector.content,
                },
            }));
            await this.client.insertPoints(this.config.collectionName, points);
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to save vectors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async deleteVector(id) {
        try {
            await this.client.deletePoint(this.config.collectionName, id);
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to delete vector: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getVectorById(id) {
        try {
            const point = await this.client.getPointById(this.config.collectionName, id);
            if (!point) {
                return null;
            }
            return this.mapToVector(point);
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to get vector by id: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async searchSimilar(embedding, limit = 5) {
        try {
            const results = await this.client.searchSimilar(this.config.collectionName, embedding, limit);
            return results.map((result) => ({
                vector: this.mapToVector(result),
                score: result.score || 0.0
            }));
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to search similar vectors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    mapToVector(point) {
        const payload = point.payload || {};
        const { content, ...metadata } = payload;
        return new entities_1.Vector({
            id: String(point.id),
            content: content || '',
            embedding: point.vector,
            metadata,
        });
    }
}
exports.VectorRepository = VectorRepository;
class VectorRepositoryFactory {
    client;
    config;
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }
    create() {
        return new VectorRepository(this.client, this.config);
    }
}
exports.VectorRepositoryFactory = VectorRepositoryFactory;
//# sourceMappingURL=VectorRepository.js.map