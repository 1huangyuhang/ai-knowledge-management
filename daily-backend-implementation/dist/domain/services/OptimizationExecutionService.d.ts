import { UUID } from '../value-objects/UUID';
import { Optimization } from '../entities/Optimization';
export interface OptimizationExecutionService {
    executeOptimization(suggestionId: UUID): Promise<Optimization>;
    getOptimizationById(id: UUID): Promise<Optimization | null>;
    getOptimizationsBySuggestion(suggestionId: UUID): Promise<Optimization[]>;
    getOptimizationsByProject(projectId: string): Promise<Optimization[]>;
    batchExecuteOptimizations(suggestionIds: UUID[]): Promise<Optimization[]>;
    rollbackOptimization(id: UUID): Promise<Optimization>;
    validateOptimization(id: UUID): Promise<Optimization>;
    getOptimizationStatus(id: UUID): Promise<string>;
    cancelOptimization(id: UUID): Promise<boolean>;
}
//# sourceMappingURL=OptimizationExecutionService.d.ts.map