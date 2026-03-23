import { Vector } from '../../../../domain/entities';
import { QdrantClient } from './QdrantClient';
export declare class QdrantBatchOperations {
    private readonly client;
    private readonly collectionName;
    constructor(client: QdrantClient, collectionName: string);
    batchInsert(vectors: Vector[], batchSize?: number): Promise<void>;
    batchDelete(ids: string[], batchSize?: number): Promise<void>;
    batchUpdate(vectors: Vector[], batchSize?: number): Promise<void>;
    batchSearch(embeddings: number[][], limit?: number, batchSize?: number): Promise<Array<Array<{
        vector: Vector;
        score: number;
    }>>>;
}
export declare class QdrantBatchOperationsFactory {
    private readonly client;
    constructor(client: QdrantClient);
    create(collectionName: string): QdrantBatchOperations;
}
//# sourceMappingURL=BatchOperations.d.ts.map