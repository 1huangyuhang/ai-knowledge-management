import { OptimizationExecutionService } from '../../domain/services/OptimizationExecutionService';
import { Optimization } from '../../domain/entities/Optimization';
import { OptimizationSuggestion } from '../../domain/entities/OptimizationSuggestion';
import { UUID } from '../../domain/value-objects/UUID';
export declare class OptimizationExecutionServiceImpl implements OptimizationExecutionService {
    executeOptimization(suggestion: OptimizationSuggestion): Promise<Optimization>;
    executeBatchOptimizations(suggestions: OptimizationSuggestion[]): Promise<Optimization[]>;
    getOptimizationById(id: UUID): Promise<Optimization | null>;
    getOptimizationsBySuggestion(suggestionId: UUID): Promise<Optimization[]>;
    private executeSuggestion;
    private validateOptimization;
}
//# sourceMappingURL=OptimizationExecutionServiceImpl.d.ts.map