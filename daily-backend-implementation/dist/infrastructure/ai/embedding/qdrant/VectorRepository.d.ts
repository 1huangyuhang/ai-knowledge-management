import { Vector, VectorRepository as IVectorRepository } from '../../../../domain/entities';
import { QdrantClient } from './QdrantClient';
export interface VectorRepositoryConfig {
    collectionName: string;
    vectorSize: number;
    distance: 'Cosine' | 'Euclid' | 'Dot';
}
export declare class VectorRepository implements IVectorRepository {
    private readonly client;
    private readonly config;
    constructor(client: QdrantClient, config: VectorRepositoryConfig);
    private initializeCollection;
    saveVector(vector: Vector): Promise<void>;
    saveVectors(vectors: Vector[]): Promise<void>;
    deleteVector(id: string): Promise<void>;
    getVectorById(id: string): Promise<Vector | null>;
    searchSimilar(embedding: number[], limit?: number): Promise<Array<{
        vector: Vector;
        score: number;
    }>>;
    private mapToVector;
}
export declare class VectorRepositoryFactory {
    private readonly client;
    private readonly config;
    constructor(client: QdrantClient, config: VectorRepositoryConfig);
    create(): IVectorRepository;
}
//# sourceMappingURL=VectorRepository.d.ts.map