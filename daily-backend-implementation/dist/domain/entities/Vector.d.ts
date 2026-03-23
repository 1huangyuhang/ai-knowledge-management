export interface VectorMetadata {
    [key: string]: any;
}
export interface VectorCreateParams {
    id: string;
    content: string;
    embedding: number[];
    metadata?: VectorMetadata;
}
export declare class Vector {
    readonly id: string;
    readonly content: string;
    readonly embedding: number[];
    readonly metadata: VectorMetadata;
    constructor(params: VectorCreateParams);
}
export interface VectorRepository {
    saveVector(vector: Vector): Promise<void>;
    saveVectors(vectors: Vector[]): Promise<void>;
    deleteVector(id: string): Promise<void>;
    getVectorById(id: string): Promise<Vector | null>;
    searchSimilar(embedding: number[], limit?: number): Promise<Array<{
        vector: Vector;
        score: number;
    }>>;
}
//# sourceMappingURL=Vector.d.ts.map