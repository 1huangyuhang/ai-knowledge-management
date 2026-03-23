import { CognitiveModel } from '../../domain/entities/cognitive-model';
import { CognitiveConcept } from '../../domain/entities/cognitive-concept';
import { CognitiveRelation } from '../../domain/entities/cognitive-relation';
import { CacheService } from '../../domain/services/cache-service';
export interface ModelUpdateOptimizerOptions {
    incrementalUpdate?: boolean;
    batchSize?: number;
    useCache?: boolean;
    cacheTtl?: number;
}
export declare class ModelUpdateOptimizer {
    private readonly cacheService?;
    private readonly defaultOptions;
    constructor(cacheService?: CacheService | undefined);
    optimizeModelUpdate(existingModel: CognitiveModel, newConcepts: CognitiveConcept[], newRelations: CognitiveRelation[], options?: ModelUpdateOptimizerOptions): Promise<CognitiveModel>;
    private performIncrementalUpdate;
    private performFullUpdate;
    private mergeConcepts;
    private mergeRelations;
    private incrementVersion;
}
//# sourceMappingURL=ModelUpdateOptimizer.d.ts.map