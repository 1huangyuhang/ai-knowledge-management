import { APICaller } from '../../api/APICaller';
export interface QdrantCollectionConfig {
    name: string;
    vectorSize: number;
    distance: 'Cosine' | 'Euclid' | 'Dot';
}
export interface QdrantPoint {
    id: string;
    vector: number[];
    payload?: Record<string, any>;
}
export interface QdrantSearchResult {
    id: string;
    score: number;
    vector?: number[];
    payload?: Record<string, any>;
}
export interface QdrantClient {
    createCollection(config: QdrantCollectionConfig): Promise<void>;
    deleteCollection(collectionName: string): Promise<void>;
    collectionExists(collectionName: string): Promise<boolean>;
    insertPoint(collectionName: string, point: QdrantPoint): Promise<void>;
    insertPoints(collectionName: string, points: QdrantPoint[]): Promise<void>;
    deletePoint(collectionName: string, id: string): Promise<void>;
    searchSimilar(collectionName: string, vector: number[], limit: number): Promise<QdrantSearchResult[]>;
    getPointById(collectionName: string, id: string): Promise<QdrantPoint | null>;
}
export interface QdrantClientConfig {
    baseUrl: string;
    apiKey?: string;
    defaultVectorSize: number;
}
export declare class QdrantClientImpl implements QdrantClient {
    private readonly caller;
    private readonly config;
    constructor(caller: APICaller, config: QdrantClientConfig);
    createCollection(config: QdrantCollectionConfig): Promise<void>;
    deleteCollection(collectionName: string): Promise<void>;
    collectionExists(collectionName: string): Promise<boolean>;
    insertPoint(collectionName: string, point: QdrantPoint): Promise<void>;
    insertPoints(collectionName: string, points: QdrantPoint[]): Promise<void>;
    deletePoint(collectionName: string, id: string): Promise<void>;
    searchSimilar(collectionName: string, vector: number[], limit: number): Promise<QdrantSearchResult[]>;
    getPointById(collectionName: string, id: string): Promise<QdrantPoint | null>;
    private getHeaders;
}
export declare class QdrantClientFactory {
    private readonly caller;
    private readonly config;
    constructor(caller: APICaller, config: QdrantClientConfig);
    create(): QdrantClient;
}
//# sourceMappingURL=QdrantClient.d.ts.map