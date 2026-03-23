import { CognitiveModel } from '../../../domain/entities';
import { CognitiveConcept } from '../../../domain/entities';
import { CognitiveRelation } from '../../../domain/entities';
import { LLMClient } from '../../services/llm/LLMClient';
export interface StructureValidationResult {
    isValid: boolean;
    validationScore: number;
    issues: ValidationIssue[];
    metrics: {
        conceptCompleteness: number;
        relationCompleteness: number;
        structuralConsistency: number;
        logicalCoherence: number;
        hierarchicalReasonableness: number;
    };
}
export interface ValidationIssue {
    type: ValidationIssueType;
    severity: ValidationIssueSeverity;
    description: string;
    relatedEntityIds: string[];
    suggestedFix?: string;
}
export declare enum ValidationIssueType {
    CONCEPT_MISSING = "concept_missing",
    RELATION_MISSING = "relation_missing",
    STRUCTURAL_INCONSISTENCY = "structural_inconsistency",
    LOGICAL_CONTRADICTION = "logical_contradiction",
    HIERARCHY_ISSUE = "hierarchy_issue",
    REDUNDANT_CONCEPT = "redundant_concept",
    REDUNDANT_RELATION = "redundant_relation",
    LOW_CONFIDENCE = "low_confidence"
}
export declare enum ValidationIssueSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
export interface StructureValidationService {
    validateStructure(model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
    validateConceptStructure(concept: CognitiveConcept, model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
    validateRelationStructure(relation: CognitiveRelation, model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
    generateValidationReport(results: StructureValidationResult[]): string;
}
export declare class RuleAndLLMBasedStructureValidationService implements StructureValidationService {
    private readonly llmClient;
    constructor(llmClient: LLMClient);
    validateStructure(model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
    validateConceptStructure(concept: CognitiveConcept, model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
    validateRelationStructure(relation: CognitiveRelation, model: CognitiveModel, concepts: CognitiveConcept[], relations: CognitiveRelation[]): Promise<StructureValidationResult>;
    generateValidationReport(results: StructureValidationResult[]): string;
    private validateConceptCompleteness;
    private validateRelationCompleteness;
    private validateStructuralConsistency;
    private validateLogicalCoherence;
    private validateHierarchicalReasonableness;
    private validateConfidenceLevels;
    private detectCycles;
    private calculateValidationScore;
}
//# sourceMappingURL=StructureValidationService.d.ts.map