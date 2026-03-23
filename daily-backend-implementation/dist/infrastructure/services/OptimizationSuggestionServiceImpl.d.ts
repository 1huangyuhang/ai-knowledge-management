import { OptimizationSuggestionService } from '../../domain/services/OptimizationSuggestionService';
import { OptimizationSuggestion } from '../../domain/entities/OptimizationSuggestion';
import { CodeAnalysis } from '../../domain/entities/CodeAnalysis';
import { UUID } from '../../domain/value-objects/UUID';
export declare class OptimizationSuggestionServiceImpl implements OptimizationSuggestionService {
    generateSuggestions(analysis: CodeAnalysis): Promise<OptimizationSuggestion[]>;
    getSuggestionById(id: UUID): Promise<OptimizationSuggestion | null>;
    getSuggestionsByAnalysis(analysisId: UUID): Promise<OptimizationSuggestion[]>;
    private generateSuggestionForIssue;
    private generateSuggestionForMetric;
}
//# sourceMappingURL=OptimizationSuggestionServiceImpl.d.ts.map