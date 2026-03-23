import { UUID } from '../value-objects/UUID';
import { OptimizationSuggestion } from '../entities/OptimizationSuggestion';
export interface OptimizationSuggestionService {
    generateSuggestions(analysisId: UUID): Promise<OptimizationSuggestion[]>;
    getSuggestionById(id: UUID): Promise<OptimizationSuggestion | null>;
    getSuggestionsByAnalysis(analysisId: UUID): Promise<OptimizationSuggestion[]>;
    getSuggestionsByProject(projectId: string): Promise<OptimizationSuggestion[]>;
    getSuggestionsByType(type: string, projectId?: string): Promise<OptimizationSuggestion[]>;
    getSuggestionsByImpact(threshold?: number, projectId?: string): Promise<OptimizationSuggestion[]>;
    deleteSuggestion(id: UUID): Promise<boolean>;
    batchGenerateSuggestions(analysisIds: UUID[]): Promise<Map<UUID, OptimizationSuggestion[]>>;
}
//# sourceMappingURL=OptimizationSuggestionService.d.ts.map