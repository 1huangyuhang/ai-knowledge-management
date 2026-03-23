export interface EmbeddingVector {
    vector: number[];
    dimension: number;
    createdAt: number;
}
export interface EmbeddingService {
    generateEmbedding(text: string, model?: string): Promise<EmbeddingVector>;
    generateEmbeddings(texts: string[], model?: string): Promise<EmbeddingVector[]>;
    getModelInfo(model: string): Promise<EmbeddingModelInfo>;
    listModels(): Promise<string[]>;
}
export interface EmbeddingModelInfo {
    name: string;
    dimension: number;
    description: string;
    available: boolean;
}
//# sourceMappingURL=EmbeddingService.d.ts.map