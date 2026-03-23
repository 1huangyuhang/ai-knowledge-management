"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantBatchOperationsFactory = exports.QdrantBatchOperations = void 0;
const entities_1 = require("../../../../domain/entities");
const VectorStoreError_1 = require("../VectorStoreError");
class QdrantBatchOperations {
    client;
    collectionName;
    constructor(client, collectionName) {
        this.client = client;
        this.collectionName = collectionName;
    }
    async batchInsert(vectors, batchSize = 100) {
        if (vectors.length === 0) {
            return;
        }
        try {
            const points = vectors.map(vector => ({
                id: vector.id,
                vector: vector.embedding,
                payload: {
                    ...vector.metadata,
                    content: vector.content
                }
            }));
            for (let i = 0; i < points.length; i += batchSize) {
                const batch = points.slice(i, i + batchSize);
                await this.client.insertPoints(this.collectionName, batch);
            }
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to batch insert vectors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async batchDelete(ids, batchSize = 100) {
        if (ids.length === 0) {
            return;
        }
        try {
            for (let i = 0; i < ids.length; i += batchSize) {
                const batch = ids.slice(i, i + batchSize);
                await Promise.all(batch.map(id => this.client.deletePoint(this.collectionName, id)));
            }
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to batch delete vectors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async batchUpdate(vectors, batchSize = 100) {
        if (vectors.length === 0) {
            return;
        }
        try {
            for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                await Promise.all(batch.map(vector => {
                    const point = {
                        id: vector.id,
                        vector: vector.embedding,
                        payload: {
                            ...vector.metadata,
                            content: vector.content
                        }
                    };
                    return this.client.updatePoint(this.collectionName, point);
                }));
            }
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to batch update vectors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async batchSearch(embeddings, limit = 5, batchSize = 10) {
        if (embeddings.length === 0) {
            return [];
        }
        try {
            const results = [];
            for (let i = 0; i < embeddings.length; i += batchSize) {
                const batch = embeddings.slice(i, i + batchSize);
                const batchResults = await Promise.all(batch.map(embedding => this.client.searchSimilar(this.collectionName, embedding, limit)));
                for (const searchResults of batchResults) {
                    const mappedResults = searchResults.map(result => {
                        const payload = result.payload || {};
                        const { content, ...metadata } = payload;
                        return {
                            vector: new entities_1.Vector({
                                id: String(result.id),
                                content: content || '',
                                embedding: result.vector,
                                metadata
                            }),
                            score: result.score || 0.0
                        };
                    });
                    results.push(mappedResults);
                }
            }
            return results;
        }
        catch (error) {
            throw new VectorStoreError_1.VectorStoreError(`Failed to batch search vectors: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.QdrantBatchOperations = QdrantBatchOperations;
class QdrantBatchOperationsFactory {
    client;
    constructor(client) {
        this.client = client;
    }
    create(collectionName) {
        return new QdrantBatchOperations(this.client, collectionName);
    }
}
exports.QdrantBatchOperationsFactory = QdrantBatchOperationsFactory;
//# sourceMappingURL=BatchOperations.js.map