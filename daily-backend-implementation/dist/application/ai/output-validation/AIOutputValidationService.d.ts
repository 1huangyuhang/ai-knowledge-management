import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation } from '../../../domain/entities';
import { LLMClient } from '../../services/llm/LLMClient';
import { ConfidenceScoringService } from '../confidence-scoring/ConfidenceScoringService';
import { StructureValidationService } from '../structure-validation/StructureValidationService';
export interface AIOutputValidationRequest {
    concepts: CognitiveConcept[];
    relations: CognitiveRelation[];
    originalInput: string;
    context?: string;
}
export interface AIOutputValidationResult {
    isValid: boolean;
    overallScore: number;
    dimensionScores: {
        conceptValidation: number;
        relationValidation: number;
        structuralConsistency: number;
        logicalCoherence: number;
        semanticAccuracy: number;
        confidenceScore: number;
    };
    issues: ValidationProblem[];
    recommendations: string[];
}
export interface ValidationProblem {
    type: ValidationProblemType;
    severity: ValidationProblemSeverity;
    description: string;
    relatedEntityIds: string[];
}
export declare enum ValidationProblemType {
    INACCURATE_CONCEPT_SEMANTICS = "inaccurate_concept_semantics",
    INCORRECT_RELATION_TYPE = "incorrect_relation_type",
    LOGICAL_CONTRADICTION = "logical_contradiction",
    STRUCTURAL_INCONSISTENCY = "structural_inconsistency",
    LOW_CONFIDENCE = "low_confidence",
    REDUNDANT_INFORMATION = "redundant_information",
    MISSING_INFORMATION = "missing_information",
    INPUT_MISMATCH = "input_mismatch"
}
export declare enum ValidationProblemSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export interface AIOutputValidationService {
    validateAIOutput(request: AIOutputValidationRequest): Promise<AIOutputValidationResult>;
    batchValidateAIOutput(requests: AIOutputValidationRequest[]): Promise<AIOutputValidationResult[]>;
    generateValidationReport(results: AIOutputValidationResult[]): string;
}
export declare class MultiDimensionalAIOutputValidationService implements AIOutputValidationService {
    private readonly llmClient;
    private readonly confidenceScoringService;
    private readonly structureValidationService;
    constructor(llmClient: LLMClient, confidenceScoringService: ConfidenceScoringService, structureValidationService: StructureValidationService);
    validateAIOutput(request: AIOutputValidationRequest): Promise<AIOutputValidationResult>;
    batchValidateAIOutput(requests: AIOutputValidationRequest[]): Promise<AIOutputValidationResult[]>;
    generateValidationReport(results: AIOutputValidationResult[]): string;
    private validateConcepts;
    private validateRelations;
    private validateSemanticAccuracy;
    private validateLogicalCoherence;
    private validateConfidence;
    private calculateOverallScore;
    private generateRecommendations;
}
//# sourceMappingURL=AIOutputValidationService.d.ts.map