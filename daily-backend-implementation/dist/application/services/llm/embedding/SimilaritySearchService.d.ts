import { Vector, VectorRepository } from '../../../../domain/entities';
import { EmbeddingService } from './EmbeddingService';
export interface SimilaritySearchResult {
    vector: Vector;
    score: number;
    metadata: Record<string, any>;
}
export interface SimilaritySearchService {
    searchSimilar(queryEmbedding: number[], limit: number, filters?: Record<string, any>): Promise<SimilaritySearchResult[]>;
    searchSimilarByContent(content: string, limit: number): Promise<SimilaritySearchResult[]>;
    batchSearchSimilar(queryEmbeddings: number[][], limit: number): Promise<SimilaritySearchResult[][]>;
}
export declare class SimilaritySearchServiceImpl implements SimilaritySearchService {
    private readonly vectorRepository;
    private readonly embeddingService;
    constructor(vectorRepository: VectorRepository, embeddingService: EmbeddingService);
    searchSimilar(queryEmbedding: number[], limit?: number, filters?: Record<string, any>): Promise<SimilaritySearchResult[]>;
    searchSimilarByContent(content: string, limit?: number): Promise<SimilaritySearchResult[]>;
    batchSearchSimilar(queryEmbeddings: number[][], limit?: number): Promise<SimilaritySearchResult[][]>;
}
//# sourceMappingURL=SimilaritySearchService.d.ts.map